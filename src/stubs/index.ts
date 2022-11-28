import fs from "fs";
import path from "path";

import { packageBaseURL, extendModuleBehavior } from "../utils";
import { config, imposter } from "../mconfig";
import { ApiStub, StubCollection, StubsModule } from "../@types";

import { initApi } from "../api-model";

import { options } from "./cors";

const loadStubs = () => {
  const directory = config.stubsFolder;
  const dirs: string[] = fs
    .readdirSync(directory)
    .filter((file: string) => fs.lstatSync(path.resolve(directory, file)).isDirectory());
  let packages: [string, StubCollection][] = [];
  dirs.forEach((dirName: string) => {
    const apiStubMock: ApiStub = require("./" + dirName);
    if (!apiStubMock.stubs) {
      return;
    }
    if (apiStubMock.baseUrl) {
      packages.push([dirName, packageBaseURL(apiStubMock.baseUrl, apiStubMock.stubs)]);
    } else {
      packages.push([dirName, apiStubMock.stubs]);
    }
  });
  return Object.fromEntries(packages);
};

const loadApis = () => {
  const directory = config.stubsFolder;
  const dirs: string[] = fs
    .readdirSync(directory)
    .filter((file: string) => fs.lstatSync(path.resolve(directory, file)).isDirectory());
  let apiStubsModule: StubsModule = {};
  dirs.forEach((dirName: string) => {
    const apiStubMock: ApiStub = require("./" + dirName);
    if (apiStubMock.apis) apiStubsModule = { ...apiStubsModule, ...initApi(dirName, apiStubMock.apis) };
  });
  return apiStubsModule;
};

export const stubsModule: StubsModule = {
  ...extendModuleBehavior({ ...loadApis(), ...loadStubs(), cors: { options } }, config, imposter),
};

const loadApiData = () => {
  const directory = config.stubsFolder;
  const dirs: string[] = fs
    .readdirSync(directory)
    .filter((file: string) => fs.lstatSync(path.resolve(directory, file)).isDirectory());
  let apisData: { api: string; data: any[] }[] = [];
  let priorities: { [key: string]: any[] } = { 1: [] };
  dirs.forEach((dirName: string) => {
    const apiStubMock: ApiStub = require("./" + dirName);
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

export const initialApisData = loadApiData();
