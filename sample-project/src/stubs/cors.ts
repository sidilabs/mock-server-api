import type { StubData } from "mock-server-api";

export const options: StubData = {
  stub: {
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
