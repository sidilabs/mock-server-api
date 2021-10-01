const config = {
  mountebankUrl: "http://localhost:2525",
  apiTimeout: 500,
  appUrl: "http://localhost:3000",
  stubsFolder: "./mocks/stubs",
};

const imposter = {
  port: 8090,
  protocol: "http",
  name: "consent-admin",
  defaultResponse: {
    statusCode: 418,
    headers: {
      "Access-Control-Allow-Origin": config.appUrl,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
      "Access-Control-Allow-Headers": "_csrf",
      "Access-Control-Expose-Headers": "_csrf",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Max-Age": 1800,
      "Mountebank-Id": "defaultResponse",
    },
  },
};

module.exports = {
  config,
  imposter,
};
