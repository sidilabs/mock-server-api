import { ApiCollection, ApiData, ApiStub, StubsModule } from "../@types";
import * as listTotal from "./list-total";

import { config, imposter } from "../mconfig";
import logger from "fancy-log";

type InitStubs = (name: string, configApi: ApiData, db: string) => StubsModule;

type Models = {
  [key: string]: InitStubs;
};

export const models: Models = {
  "list-total": listTotal.initStubs,
};

export function initApi(packName: string, apiCollection: ApiCollection) {
  let stubsModule: StubsModule = {};
  Object.keys(apiCollection).forEach((key) => {
    const apiData = apiCollection[key];
    const initStubs = models[apiData.model];
    stubsModule = { ...stubsModule, ...initStubs(`${packName ? packName + "/" : ""}${key}`, apiData, config.memDB) };
  });
  return stubsModule;
}
