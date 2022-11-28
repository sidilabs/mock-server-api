import { ApiCollection, ApiData, ApiStub, StubsModule } from "../@types";
import * as listTotal from "./list-total";
import * as internalList from "./internal-list";

import { config, imposter } from "../mconfig";

type InitStubs = (name: string, configApi: ApiData<any>, db: string) => StubsModule;

type Models = {
  [key: string]: InitStubs;
};

export const models: Models = {
  "list-total": listTotal.initStubs,
  "internal-list": internalList.initStubs,
};

export function initApi(packName: string, apiCollection: ApiCollection) {
  let stubsModule: StubsModule = {};
  Object.keys(apiCollection).forEach((key) => {
    const apiData = apiCollection[key];
    const initStubs = models[apiData.model || "list-total"];
    stubsModule = { ...stubsModule, ...initStubs(`${packName ? packName + "/" : ""}${key}`, apiData, config.memDB) };
  });
  return stubsModule;
}
