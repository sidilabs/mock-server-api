import type { ConfigInjection, StubCollection } from "mock-server-api";
import { imposter } from "../../mbconfig";

const details = { asd: 1 };

export const cors = (config: any) => {
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
