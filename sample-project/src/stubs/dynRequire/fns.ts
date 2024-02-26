import { ConfigInjection } from "mock-server-api";

export const firstFn = (config: ConfigInjection) => {
  return { body: config.request.path };
};
