import type { Config, ImposterDefaults } from "mock-server-api";

import path from "path";

export const config: Config = (() => {
  const stubsFolder = path.join(__dirname, "..", "dist", "stubs");
  return {
    mountebankUrl: "http://localhost",
    mountebankPort: "2525",
    apiTimeout: 500,
    appUrl: "http://localhost:3000",
    stubsFolder,
    memDB: "__db__",
    axios: {
      timeout: {
        clearImposter: 1000,
        createImposter: 500,
        createStub: 1000,
        loadStubData: 1000,
      },
    },
  };
})();

export const imposter: ImposterDefaults = {
  port: 8090,
  protocol: "http",
  name: "project-sample",
  defaultResponse: {
    statusCode: 418,
    headers: {
      "Access-Control-Allow-Origin": config.appUrl,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
      "Access-Control-Allow-Headers": "_csrf, Content-Type",
      "Access-Control-Expose-Headers": "_csrf",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Max-Age": 1800,
      "Mountebank-Id": "defaultResponse",
    },
  },
};
