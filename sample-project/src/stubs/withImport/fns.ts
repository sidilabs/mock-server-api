import type { ConfigInjection } from "mock-server-api";

export const data = {
  a: 1,
  b: "b",
  c: [] as any[],
};
export const firstFn = (config: ConfigInjection) => {
  config.logger.warn(JSON.stringify(data));

  data.a = data.a + 1;
  data.b = data.b + "b";
  data.c = [...data.c, data.a];

  return { body: config.request.path };
};
