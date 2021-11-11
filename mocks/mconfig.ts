export type MConfig = {
  mountebankUrl: string;
  mountebankPort: string;
  apiTimeout: number;
  appUrl: string;
  stubsFolder: string;
  memDB: string;
};

export const config: MConfig = {
  mountebankUrl: "http://localhost",
  mountebankPort: "2525",
  apiTimeout: 500,
  appUrl: "http://localhost:3000",
  stubsFolder: "./mocks/stubs",
  memDB: "__db__",
};

export type ImposterDefaults = {
  port: number;
  protocol: string;
  name: string;
  defaultResponse: {
    statusCode: string | number;
    headers: {
      [key: string]: string | number | boolean;
    };
  };
};

export const imposter: ImposterDefaults = {
  port: 8090,
  protocol: "http",
  name: "consent-admin",
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
