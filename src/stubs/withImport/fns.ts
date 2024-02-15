import { ConfigInjection } from "../../@types";

export const firstFn = (config: ConfigInjection) => {
  return { body: config.request.path };
};
