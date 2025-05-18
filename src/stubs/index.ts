import fs from "fs";
import path from "path";

import { packageBaseURL, extendModuleBehavior, MockConfig, injectRunFunction } from "../utils";

import { ApiStub, StubCollection, StubsModule } from "../@types";
import { initApi } from "../api-model";

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
    if (apiStubMock.baseUrl) {
      packages.push([
        dirName,
        injectRunFunction(packageBaseURL(apiStubMock.baseUrl, apiStubMock.stubs), mockConfig.config, dirName),
      ]);
    } else {
      packages.push([dirName, injectRunFunction(apiStubMock.stubs, mockConfig.config, dirName)]);
    }
  });
  return Object.fromEntries(packages);
};

const loadApis = (mockConfig: MockConfig) => {
  const { config } = mockConfig;
  const directory = config.stubsFolder;
  console.log(directory);
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
  const { config } = mockConfig;
  return {
    ...extendModuleBehavior({ ...loadApis(mockConfig), ...loadStubs(mockConfig) }, config),
  } as StubsModule;
};

export const loadStubsApiData = (mockConfig: MockConfig) => {
  const { config } = mockConfig;
  const directory = config.stubsFolder;
  const dirs: string[] = fs
    .readdirSync(directory)
    .filter((file: string) => fs.lstatSync(path.resolve(directory, file)).isDirectory());

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
          priorities[apiConfig.dataPriority].push({ state: apiConfig.state, data: apiConfig.data });
        } else {
          priorities[1].push({ state: apiConfig.state, data: apiConfig.data });
        }
      }
    });
  });
  let apisData: { state: string; data: any[] }[] = [];
  Object.keys(priorities).forEach((key) => {
    apisData = [...priorities[key]];
  });
  return apisData;
};
