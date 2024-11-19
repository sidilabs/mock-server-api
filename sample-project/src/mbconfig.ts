import type { Config, ConfigInjection, ImposterDefaults } from "mock-server-api";

import path from "path";

export const config: Config = (() => {
  //generated stubs folder after transpilation
  const stubsFolder = path.join(__dirname, "..", "dist", "stubs");
  return {
    //info about the mountebank server
    mountebankUrl: "http://localhost",
    mountebankPort: "2525",

    // default timeout to responses
    apiTimeout: 500,

    //info used on the default response, also for CORS:   "Access-Control-Allow-Origin": config.appUrl,
    appUrl: "http://localhost:2525",

    //info used to locate all stubs and files associated
    stubsFolder,

    //custom attribute used as repository inside mountbank when using 'export const apis: ApiCollection = ...'
    memDB: "__db__",

    //configuration used to axios to submit the stub data to the mountebank server
    axios: {
      timeout: {
        clearImposter: 1000,
        createImposter: 500,
        createStub: 1000,
        loadStubData: 1000,
      },
    },
    globalRun: "options.cors",
  };
})();

//configuration to the imposter, the imposter is the mocked server api that the stubs will point to
export const imposter: ImposterDefaults = {
  //infos used to the mocked api
  port: 8090,
  protocol: "http",
  name: "project-sample",

  //if there is some mistake with the request this will be default response configuration,
  defaultResponse: {
    statusCode: 418,
    //this headers will also be used as the default headers for every request.
    headers: {
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
      "Access-Control-Allow-Headers": "_csrf, Content-Type",
      "Access-Control-Expose-Headers": "_csrf",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Max-Age": 1800,
      "Mountebank-Id": "defaultResponse",
    },
  },
};
