import type { ConfigInjection, StubCollection } from "mock-server-api";
import { imposter } from "../../mbconfig";

export const cors = (config: any) => {
  const defaultHeaders = imposter.defaultResponse.headers;
  config.response.statusCode = config.response.statusCode || 200;
  const currentHeaders = config.response.headers || {};
  let a = Math.floor(Math.random() * 10);
  let b = Math.floor(Math.random() * 10);
  let c = Math.floor(Math.random() * 10);
  config.response.headers = {
    ...defaultHeaders,
    _csrf: `${a}${b}${c}-annn`,
    ...currentHeaders,
    "Access-Control-Allow-Origin":
      config.request.headers?.Origin ||
      imposter.defaultResponse.headers?.["Access-Control-Allow-Origin"] ||
      "localhost",
  };
  return config.response;
};

export const stubs: StubCollection = {
  cors: {
    predicates: [
      {
        equals: {
          method: "OPTIONS",
        },
      },
    ],
    responses: [
      {
        is: {
          statusCode: 200,
        },
      },
    ],
  },
};
