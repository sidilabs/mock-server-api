import { ApiCollection } from "../../../../dist";

export const apis: ApiCollection = {
  sample: {
    state: "entity",
    api: "/_demo/api",
    data: [
      { id: 1, name: "test" },
      { id: 2, name: "second" },
    ],
    config: {
      result: "content",
    },
  },
};
