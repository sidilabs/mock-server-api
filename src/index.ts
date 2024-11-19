import axios from "axios";
import { ConfigInjection, Stub, StubData } from "./@types";
import { loadStubModules, loadStubsApiData } from "./stubs";
import { loadConfig, MockConfig, stub } from "./utils";

async function restartImposter({ config, imposter }: MockConfig) {
  const mbconfig = loadConfig();
  const urlImposters = config.mountebankUrl + ":" + config.mountebankPort + "/imposters";

  try {
    await axios({
      method: "delete",
      url: urlImposters + "/" + imposter.port,
      timeout: mbconfig.config.axios?.timeout?.clearImposter,
    });
    await axios({
      method: "post",
      url: urlImposters,
      timeout: mbconfig.config.axios?.timeout?.createImposter,
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
      timeout: mbconfig.config.axios?.timeout?.createStub,
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

async function loadStateData({ config, imposter }: MockConfig, state: string, data: any[]) {
  const mbconfig = loadConfig();
  const urlMockedApi = config.mountebankUrl + ":" + imposter.port;
  try {
    const response = await axios({
      method: "post",
      url: urlMockedApi + "/__state?state=" + state + "&db=" + config.memDB,
      timeout: mbconfig.config.axios?.timeout?.loadStubData,
      data,
    });
    const status = response.status;
    if (status >= 200 && status < 300) {
      console.log(`Loaded api: ${state}`);
    } else {
      console.error(`Error loading data: ${state}`, response);
    }
  } catch (e) {
    console.error(`Error loading data: ${state}`, e);
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

const createRequiresClearCache = async (mockConfig: MockConfig) => {
  //create stub to set state data
  let stubSet = {
    predicates: [
      {
        matches: {
          method: "GET",
          path: "/__requires/clear$",
          query: {
            db: ".+",
          },
        },
      },
    ],
    responses: [
      {
        inject: function injectRequiresClearCache(config: ConfigInjection) {
          let cleared = false;
          const db = config.request.query.db;

          if (config.state["__requires"]?.[db]) {
            Object.keys(config.state["__requires"][db]).forEach((path) => {
              delete require.cache[path];
            });
            cleared = true;
          }
          const __requires = config.state["__requires"]?.[db] || {};
          if (!config.state["__requires"]) {
            config.state["__requires"] = {};
          }
          config.state["__requires"][db] = {};
          return {
            statusCode: 200,
            body: __requires,
          };
        }.toString(),
      },
    ],
  } as Stub;
  try {
    await saveStub(mockConfig, `__state:set`, stubSet);
  } catch {}
};

const runRequiresClearCache = async (mockConfig: MockConfig) => {
  try {
    await new Promise((resolve) => {
      setTimeout(() => resolve(true), 500);
    });

    const urlMockedApi = mockConfig.config.mountebankUrl + ":" + mockConfig.imposter.port;
    await axios({
      method: "get",
      url: urlMockedApi + "/__requires/clear?db=" + mockConfig.config.memDB,
    });
  } catch {}
};

const initializeApiData = async (mockConfig: MockConfig) => {
  await new Promise((resolve, reject) => {
    setTimeout(() => resolve(true), 500);
  });
  const initialApisData = loadStubsApiData(mockConfig);

  if (initialApisData.length > 0) {
    //create stub to set state data
    let stubSet = {
      predicates: [
        {
          matches: {
            method: "POST",
            path: "/__state$",
            query: { db: ".+", state: ".+" },
          },
        },
      ],
      responses: [
        {
          inject: function injectLoadData(config: ConfigInjection) {
            const { db, state, id } = config.request.query;

            const stateDefinition = {
              [state]: {
                lastId: 0,
                data: [],
              },
            };
            if (!config.state[db]) {
              config.state[db] = stateDefinition;
            } else if (!config.state[db][state]) {
              config.state[db][state] = stateDefinition[state];
            }
            const stateData = config.state[db][state];
            const jsonDataArray: any[] = JSON.parse(config.request.body);
            stateData.lastId = jsonDataArray.at(-1)[id || "id"];
            stateData.data = jsonDataArray;
            return {
              statusCode: 204,
            };
          }.toString(),
        },
      ],
    } as Stub;
    await saveStub(mockConfig, `__state:set`, stubSet);
    await new Promise((resolve, _) => {
      setTimeout(() => resolve(true), 500);
    });
  }
  //({ config, imposter }: MockConfig, stub: string, data: Stub

  initialApisData.forEach((apiData) => {
    loadStateData(mockConfig, apiData.state, apiData.data);
  });
};

export const init = async (configPathWithoutExtension?: string) => {
  const config = loadConfig(configPathWithoutExtension);
  //always try to call the clear cache
  await runRequiresClearCache(config);
  await restartImposter(config);
  await createRequiresClearCache(config);
  await createStubs(config);

  await initializeApiData(config);
};

export { packageBaseURL } from "./utils";
export type { Config, ImposterDefaults } from "./utils/mbconfig";
export * from "./@types";
export type { ConfigList, QueryFilterMap } from "./api-model/list-total";
export * as queryFns from "./api-model/list-total/utils";
