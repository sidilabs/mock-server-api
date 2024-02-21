import path from "path";
import { ConfigInjection, StubCollection } from "../../@types";
import type { firstFn as firstFn } from "./fns";

const injectResponseRequire = (config: ConfigInjection) => {
  const p = require("path") as typeof path;
  const pathFns = p.resolve(process.cwd(), "dist", "stubs", "withImport", "fns");
  delete require.cache[require.resolve(pathFns)];

  const fns = require(pathFns) as { firstFn: typeof firstFn };
  config.logger.error(JSON.stringify(Object.keys(fns)));

  return fns.firstFn(config);
};

export const stubs: StubCollection = {
  withImport: {
    stub: {
      predicates: [{ equals: { method: "GET", path: "/_demo/withRequire" } }],
      responses: [{ inject: injectResponseRequire.toString() }],
    },
  },
};
