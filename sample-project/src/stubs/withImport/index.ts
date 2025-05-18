import type { ConfigInjection, StubCollection } from "mock-server-api";

const data = {
  a: 2,
  b: "c",
  c: [1] as any[],
};

export const innerFn = (config: ConfigInjection) => {
  config.logger.warn(JSON.stringify(data));

  data.a = data.a + 1;
  data.b = data.b + "b";
  data.c = [...data.c, data.a];

  return { body: config.request.path + ":INNER" };
};

export const stubs: StubCollection = {
  withImport: {
    predicates: [{ equals: { method: "GET", path: "/_demo/withImport" } }],
    responses: [
      {
        run: "/withImport/fns.firstFn",
        behaviors: [
          {
            wait: 1000,
          },
        ],
      },
      {
        inject: (config) => {
          config.logger.warn(JSON.stringify(data));

          data.a = data.a + 1;
          data.b = data.b + "b";
          data.c = [...data.c, data.a];

          return { body: config.request.path + ":INNER" };
        },
      },
    ],
  },
};
