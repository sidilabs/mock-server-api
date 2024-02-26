import { StubCollection } from "mock-server-api";

export const stubs: StubCollection = {
  dynRequire: {
    stub: {
      predicates: [{ equals: { method: "GET", path: "/_demo/dynRequire" } }],
      responses: [{ $inject: "dynRequire/fns/firstFn" }],
    },
  },
};
