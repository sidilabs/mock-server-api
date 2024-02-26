import path from "path";
import { StubCollection } from "../../@types";

export const stubs: StubCollection = {
  dynRequire: {
    stub: {
      predicates: [{ equals: { method: "GET", path: "/_demo/dynRequire" } }],
      responses: [{ $inject: "dynRequire/fns/firstFn" }],
    },
  },
};
