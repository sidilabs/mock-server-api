import type { ApiCollection } from "mock-server-api";

export const apis: ApiCollection = {
  sample: {
    model: "list-total",
    state: "entity",
    api: "/_demo/api",
    data: [
      { id: 1, name: "test" },
      { id: 2, name: "second" },
    ],
  },
};
