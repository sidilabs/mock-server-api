import { ConfigInjection } from "mock-server-api";
export const clearCache = (config: ConfigInjection) => {
  Object.keys(require.cache)
    .filter((key) => key.includes("mock-api-b2b\\dist"))
    .forEach((key) => {
      delete require.cache[key];
    });
  return { body: "cleaned!" };
};
export const stubs = {
  clearCache: {
    stub: {
      predicates: [{ equals: { method: "GET", path: "/--clear-cache" } }],
      responses: [
        {
          run: "/clear-cache.clearCache",
        },
      ],
    },
  },
};
