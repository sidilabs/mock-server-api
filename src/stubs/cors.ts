import { StubData } from "../@types";

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
