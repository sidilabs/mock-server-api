import fs from "fs";
import path from "path";

import { packageExtendBehavior, packageBaseURL } from "../utils";
import { config, imposter } from "../mconfig";
import { ConfigInjection, StubCollection, StubsModule, StubData } from "../@types";

import { cors } from "./cors";

const extendBehavior = (all: StubsModule) => {
  let headers: { [key: string]: string | boolean | number } = { ...imposter.defaultResponse.headers };
  delete headers["Mountebank-Id"];
  let strHeaders = JSON.stringify(headers);

  const decorate = ((config: ConfigInjection) => {
    config.response.statusCode = config.response.statusCode || 200;
    const headers = config.response.headers || {};
    let a = Math.floor(Math.random() * 10);
    let b = Math.floor(Math.random() * 10);
    let c = Math.floor(Math.random() * 10);
    const defaultHeaders: any = "#####";
    config.response.headers = {
      ...headers,
      ...defaultHeaders,
      _csrf: `${a}${b}${c}a001e-1c45-4c33-853f-643f9bbb0bad`,
    };
  })
    .toString()
    .replace("'#####'", strHeaders);

  for (const name in all) {
    const packageStubs: StubCollection = all[name];
    packageExtendBehavior(packageStubs, decorate, { wait: config.apiTimeout }, name);
  }
  return all;
};

const loadStubs = () => {
  const directory = config.stubsFolder;
  const dirs: string[] = fs
    .readdirSync(directory)
    .filter((file: string) => fs.lstatSync(path.resolve(directory, file)).isDirectory());
  const packages = dirs.map((dirName: string) => {
    const packageConfig = require("./" + dirName);
    if (packageConfig.baseUrl) {
      return [dirName, packageBaseURL(packageConfig.baseUrl, packageConfig.stubs)];
    } else {
      return [dirName, packageConfig.stubs];
    }
  });
  return Object.fromEntries(packages);
};
export const stubsModule: StubsModule = {
  ...extendBehavior({ cors: { cors }, ...loadStubs() }),
};
