import { ApiCollection, ApiData, ApiStub, StubsModule } from "../@types";
import * as listTotal from "./list-total";
import * as internalList from "./internal-list";
import { MockConfig } from "../utils";

type InitStubs = (name: string, configApi: ApiData<any>, db: string) => StubsModule;

type Models = {
  [key: string]: InitStubs;
};

export const models: Models = {
  "list-total": listTotal.initStubs,
  "internal-list": internalList.initStubs,
};

export function initApi(mockConfig: MockConfig, packName: string, apiCollection: ApiCollection) {
  const { config } = mockConfig;
  let stubsModule: StubsModule = {};
  Object.keys(apiCollection).forEach((key) => {
    const apiData = apiCollection[key];
    const initStubs = models[apiData.model || "list-total"];
    stubsModule = { ...stubsModule, ...initStubs(`${packName ? packName + "/" : ""}${key}`, apiData, config.memDB) };
  });
  return stubsModule;
}
