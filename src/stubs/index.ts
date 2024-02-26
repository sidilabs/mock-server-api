import fs from "fs";
import path from "path";

import { packageBaseURL, extendModuleBehavior, MockConfig } from "../utils";

import { ApiStub, ConfigInjection, Predicate, Response, StubCollection, StubsModule } from "../@types";
import { initApi } from "../api-model";
import { options } from "./cors";

const fnRequireStr = ((config: any) => {
  const p = require("path") as typeof path;
  const arrPath = [process.cwd(), "dist", "stubs", "###PATH_REQUIRE###"];

  const fnName = arrPath.pop() as string;
  const pathFns = p.resolve(...arrPath);
  delete require.cache[require.resolve(pathFns)];

  const exported = require(pathFns);
  return exported[fnName](config);
}).toString();

const loadInject = (predicate: { $inject?: string; inject?: string }) => {
  if (predicate.$inject) {
    predicate.inject = fnRequireStr.replace(
      /"###PATH_REQUIRE###"/,
      predicate.$inject
        .split("/")
        .map((p) => `"${p}"`)
        .toString()
    );
  }
};

const loadRequirePredicates = (predicates: Predicate[]) => {
  predicates.forEach((predicate) => {
    loadInject(predicate);
    if (predicate.and) {
      loadRequirePredicates(predicate.and);
    }
    if (predicate.or) {
      loadRequirePredicates(predicate.or);
    }
  });
};

const loadRequireResponse = (responses: Response[]) => {
  responses.forEach((response) => {
    if (response.$inject) {
      loadInject(response);
    }
    if (response._behaviors?.$decorate) {
      response._behaviors.decorate = fnRequireStr.replace(
        /"###PATH_REQUIRE###"/,
        response._behaviors.$decorate
          .split("/")
          .map((p) => `"${p}"`)
          .toString()
      );
    }
  });
};

const loadRequireStub = (stubs: StubCollection) => {
  Object.entries(stubs).forEach(([key, { stub }]) => {
    loadRequirePredicates(stub.predicates);
    loadRequireResponse(stub.responses);
  });
};

const loadStubs = (mockConfig: MockConfig) => {
  const { config, imposter } = mockConfig;
  const directory = config.stubsFolder;
  console.log("directory: " + directory);
  const dirs: string[] = fs
    .readdirSync(directory)
    .filter((file: string) => fs.lstatSync(path.resolve(directory, file)).isDirectory());
  let packages: [string, StubCollection][] = [];
  dirs.forEach((dirName: string) => {
    const apiStubMock: ApiStub = require(path.resolve(directory, dirName));
    if (!apiStubMock.stubs) {
      return;
    }
    let result: StubCollection;
    if (apiStubMock.baseUrl) {
      result = packageBaseURL(apiStubMock.baseUrl, apiStubMock.stubs);
    } else {
      result = apiStubMock.stubs;
    }
    loadRequireStub(result);
    packages.push([dirName, result]);
  });
  return Object.fromEntries(packages);
};

const loadApis = (mockConfig: MockConfig) => {
  const { config } = mockConfig;
  const directory = config.stubsFolder;
  const dirs: string[] = fs
    .readdirSync(directory)
    .filter((file: string) => fs.lstatSync(path.resolve(directory, file)).isDirectory());
  let apiStubsModule: StubsModule = {};
  dirs.forEach((dirName: string) => {
    const apiStubMock: ApiStub = require(path.resolve(directory, dirName));
    if (apiStubMock.apis) apiStubsModule = { ...apiStubsModule, ...initApi(mockConfig, dirName, apiStubMock.apis) };
  });
  return apiStubsModule;
};

export const loadStubModules = (mockConfig: MockConfig) => {
  const { config, imposter } = mockConfig;
  return {
    ...extendModuleBehavior({ ...loadApis(mockConfig), ...loadStubs(mockConfig), cors: { options } }, config, imposter),
  } as StubsModule;
};

export const loadStubsApiData = (mockConfig: MockConfig) => {
  const { config } = mockConfig;
  const directory = config.stubsFolder;
  const dirs: string[] = fs
    .readdirSync(directory)
    .filter((file: string) => fs.lstatSync(path.resolve(directory, file)).isDirectory());
  let apisData: { api: string; data: any[] }[] = [];
  let priorities: { [key: string]: any[] } = { 1: [] };
  dirs.forEach((dirName: string) => {
    const apiStubMock: ApiStub = require(path.resolve(directory, dirName));
    if (!apiStubMock.apis) return;
    Object.keys(apiStubMock.apis).forEach((key: string) => {
      if (!apiStubMock.apis) return;
      const apiConfig = apiStubMock.apis[key];
      if (apiConfig.data) {
        if (apiConfig.dataPriority) {
          priorities[apiConfig.dataPriority] = priorities[apiConfig.dataPriority] || [];
          priorities[apiConfig.dataPriority].push({ api: apiConfig.dataApi || apiConfig.api, data: apiConfig.data });
        } else {
          priorities[1].push({ api: apiConfig.dataApi || apiConfig.api, data: apiConfig.data });
        }
      }
    });
  });
  Object.keys(priorities).forEach((key) => {
    apisData = [...apisData, ...priorities[key]];
  });
  return apisData;
};
