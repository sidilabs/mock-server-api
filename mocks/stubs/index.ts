import fs from "fs";
import path from "path";

import { packageBaseURL, extendModuleBehavior } from "../utils";
import { config, imposter } from "../mconfig";
import { ApiStub, StubCollection, StubsModule } from "../@types";

import { initApi } from "../api-model";

import { cors } from "./cors";
import log from "fancy-log";

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
  ...extendModuleBehavior({ ...loadApis(), ...loadStubs(), cors: { cors } }, config, imposter),
};

const loadApiData = () => {
  const directory = config.stubsFolder;
  const dirs: string[] = fs
    .readdirSync(directory)
    .filter((file: string) => fs.lstatSync(path.resolve(directory, file)).isDirectory());
  let apisData: { api: string; data: any[] }[] = [];
  dirs.forEach((dirName: string) => {
    const apiStubMock: ApiStub = require("./" + dirName);
    if (!apiStubMock.apis) return;
    Object.keys(apiStubMock.apis).forEach((key: string) => {
      if (!apiStubMock.apis) return;
      const apiConfig = apiStubMock.apis[key];
      if (apiConfig.data) {
        apisData.push({ api: apiConfig.api, data: apiConfig.data });
      }
    });
  });
  return apisData;
};

export const initialApisData = loadApiData();
