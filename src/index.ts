import axios from "axios";
import { Stub, StubData } from "./@types";
import { loadStubModules, loadStubsApiData } from "./stubs";
import { loadConfig, MockConfig, stub } from "./utils";

async function restartImposter({ config, imposter }: MockConfig) {
  const mbconfig = loadConfig();
  const urlImposters = config.mountebankUrl + ":" + config.mountebankPort + "/imposters";

  try {
    await axios({
      method: "delete",
      url: urlImposters + "/" + imposter.port,
      timeout: mbconfig.config.axios.timeout.clearImposter,
    });
    await axios({
      method: "post",
      url: urlImposters,
      timeout: mbconfig.config.axios.timeout.createImposter,
      data: imposter,
    });
    console.log("Imposter at " + imposter.port + " (re)started...");
  } catch (error: any) {
    console.log(error.response);
    throw error;
  } finally {
  }
}

async function saveStub({ config, imposter }: MockConfig, stub: string, data: Stub) {
  const mbconfig = loadConfig();
  const urlImposters = config.mountebankUrl + ":" + config.mountebankPort + "/imposters";
  try {
    const response = await axios({
      method: "post",
      url: urlImposters + "/" + imposter.port + "/stubs",
      timeout: mbconfig.config.axios.timeout.createStub,
      data: { stub: data },
    });
    const status = response.status;
    if (status >= 200 && status < 300) {
      console.log(`Stub: ${stub}`);
    } else {
      console.error(`Error stubbing data: ${stub}`, response);
    }
  } catch (e) {
    console.error(`Error stubbing: ${stub}`, e);
  }
}

async function loadApiData({ config, imposter }: MockConfig, api: string, data: any[]) {
  const mbconfig = loadConfig();
  const urlMockedApi = config.mountebankUrl + ":" + imposter.port;
  try {
    const response = await axios({
      method: "post",
      url: "__data/" + urlMockedApi + api,
      timeout: mbconfig.config.axios.timeout.loadStubData,
      data,
    });
    const status = response.status;
    if (status >= 200 && status < 300) {
      console.log(`Loaded api: ${api}`);
    } else {
      console.error(`Error loading data: ${api}`, response);
    }
  } catch (e) {
    console.error(`Error loading data: ${api}`, e);
  }
}

const createStubs = async (mockConfig: MockConfig) => {
  const stubsModule = loadStubModules(mockConfig);
  for (const spNames in stubsModule) {
    const stubsCollection = stubsModule[spNames];
    for (const sNames in stubsCollection) {
      const stubData = stub(stubsCollection[sNames]);
      await saveStub(mockConfig, `${spNames}:${sNames}`, stubData);
    }
  }
};

const initializeApiData = async (mockConfig: MockConfig) => {
  await new Promise((resolve, reject) => {
    setTimeout(() => resolve(true), 500);
  });
  const initialApisData = loadStubsApiData(mockConfig);
  for (var index in initialApisData) {
    const apiData = initialApisData[index];
    loadApiData(mockConfig, apiData.api, apiData.data);
  }
};

export const init = async (configPathWithoutExtension?: string) => {
  const config = loadConfig(configPathWithoutExtension);
  await restartImposter(config);
  await createStubs(config);
  await initializeApiData(config);
};

export type { Config, ImposterDefaults } from "./utils/mbconfig";
export * from "./@types";
export type { ConfigList, QueryFilterMap } from "./api-model/list-total";
export * as queryFns from "./api-model/list-total/utils";
