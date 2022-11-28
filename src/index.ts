import axios from "axios";
import log from "fancy-log";
import { StubData } from "./@types";

import { config, imposter } from "./mconfig";

const urlImposters = config.mountebankUrl + ":" + config.mountebankPort + "/imposters";

const urlMockedApi = config.mountebankUrl + ":" + imposter.port;

import { stubsModule, initialApisData } from "./stubs";

async function restartImposter() {
  try {
    await axios({
      method: "delete",
      url: urlImposters + "/" + imposter.port,
      timeout: 1000,
    });
    await axios({
      method: "post",
      url: urlImposters,
      timeout: 500,
      data: imposter,
    });
    log("Imposter at " + imposter.port + " (re)started...");
  } catch (error: any) {
    log(error.response);
    throw error;
  } finally {
  }
}

async function saveStub(stub: string, data: StubData) {
  try {
    const response = await axios({
      method: "post",
      url: urlImposters + "/" + imposter.port + "/stubs",
      timeout: 1000,
      data,
    });
    const status = response.status;
    if (status >= 200 && status < 300) {
      log(`Stub: ${stub}`);
    } else {
      log.error(`Error stubbing data: ${stub}`, response);
    }
  } catch (e) {
    log.error(`Error stubbing: ${stub}`, e);
  }
}

async function loadApiData(api: string, data: any[]) {
  try {
    const response = await axios({
      method: "patch",
      url: urlMockedApi + api,
      timeout: 1000,
      data,
    });
    const status = response.status;
    if (status >= 200 && status < 300) {
      log(`Loaded api: ${api}`);
    } else {
      log.error(`Error loading data: ${api}`, response);
    }
  } catch (e) {
    log.error(`Error loading data: ${api}`, e);
  }
}

const createStubs = async () => {
  for (const spNames in stubsModule) {
    const stubsCollection = stubsModule[spNames];
    for (const sNames in stubsCollection) {
      const stubData = stubsCollection[sNames];
      await saveStub(`${spNames}:${sNames}`, stubData);
    }
  }
};

const initializeApiData = async () => {
  await new Promise((resolve, reject) => {
    setTimeout(() => resolve(true), 500);
  });
  for (var index in initialApisData) {
    const apiData = initialApisData[index];
    loadApiData(apiData.api, apiData.data);
  }
};

export const init = async () => {
  await restartImposter();
  await createStubs();
  await initializeApiData();
};
