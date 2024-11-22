import {
  Behavior,
  FunctionString,
  StubCollection,
  Predicate,
  PredicateDef,
  Response,
  Stub,
  ConfigInjection,
  StubsModule,
  StubData,
} from "../@types";

import fs from "fs";
import { ImposterDefaults, Config } from "./mbconfig";
import path from "path";

export type MockConfig = { config: Config; imposter: ImposterDefaults };

const loadConfig = (filePathWithoutExtension?: string) => {
  let fileconfig = null;
  let hasFound = false;
  let extension = ".ts";
  let fullPath = filePathWithoutExtension ?? "mbconfig" + extension;
  try {
    if (fs.existsSync(path.resolve(fullPath))) {
      hasFound = true;
    } else {
      extension = ".js";
      if (fs.existsSync(path.resolve(fullPath))) {
        hasFound = true;
      }
    }
  } catch (err) {
    console.error(err);
  }
  if (hasFound) {
    fileconfig = require(path.resolve(fullPath));
  } else {
    if (fs.existsSync(path.resolve(process.cwd(), "dist", "mbconfig.js"))) {
      fileconfig = require(path.resolve(process.cwd(), "dist", "mbconfig.js"));
    } else if (fs.existsSync(path.resolve(process.cwd(), "mbconfig.js"))) {
      fileconfig = require(path.resolve(process.cwd(), "mbconfig.js"));
    } else if (fs.existsSync(path.resolve(__dirname, "mbconfig.js"))) {
      fileconfig = require(path.resolve(__dirname, "mbconfig.js"));
    } else {
      fileconfig = require(path.resolve(__dirname, "mbconfig.ts"));
    }
  }
  const config = (fileconfig || {}) as MockConfig;
  return config;
};

const responseExtendBehavior = (
  response: Response,
  decorate: FunctionString,
  behavior: Behavior = {}, // { wait: ... }
  identifier = "defaultId"
) => {
  if (response) {
    let addIdentifier = (config: ConfigInjection) => {
      const headers = config.response.headers || {};
      config.response.headers = {
        "Mountebank-Id": "####",
        ...headers,
      };
      return config.response;
    };
    let addId = addIdentifier.toString().replace("####", identifier);

    if (!response.behaviors) {
      response.behaviors = [];
    }
    response.behaviors = [behavior, { decorate: addId.toString() }, { decorate }, ...response.behaviors];
  }
};

const stubExtendBehavior = (stub: Stub, decorate: FunctionString, behavior: Behavior, identifier: string) => {
  for (let response of stub.responses || [{}]) {
    responseExtendBehavior(response, decorate, behavior, identifier);
  }
};

export const stub = (d: StubData | Stub) => {
  if ((d as StubData).stub) {
    return (d as StubData).stub;
  } else {
    return d as Stub;
  }
};

const packageExtendBehavior = (
  packageStubs: StubCollection,
  decorate: FunctionString,
  behavior: Behavior,
  pkgName = ""
) => {
  for (let pkgItem in packageStubs) {
    const data = packageStubs[pkgItem];
    stubExtendBehavior(stub(data), decorate, behavior, pkgName && pkgName + ":" + pkgItem);
  }
};

const predicateBaseURL = (url: string, predicateObj: Predicate, n = 0) => {
  for (let property in predicateObj) {
    if (property === "equals" || property === "matches") {
      let predicateDef = predicateObj[property] as PredicateDef;
      const path = predicateDef.path;
      predicateDef.path = `${url}${path}`;
    } else {
      if (property === "and" || property === "or") {
        const predicateGroup = predicateObj[property] as Predicate[];
        if (predicateGroup instanceof Array) {
          for (let j in predicateGroup) {
            predicateBaseURL(url, predicateGroup[j], 1);
          }
        }
      }
    }
  }
};

const packageBaseURL = (url: string, packageStubs: StubCollection) => {
  for (let i in packageStubs) {
    const data = packageStubs[i];
    for (let r in stub(data).predicates) {
      let predicate = stub(data).predicates[r];
      predicateBaseURL(url, predicate);
    }
  }
  return packageStubs;
};

export const injectRunFunction = (packageStubs: StubCollection, config: Config) => {
  for (let i in packageStubs) {
    const data = packageStubs[i];
    for (let r in stub(data).responses) {
      let response = stub(data).responses[r];
      responseInjectRunFunction(response, config);
    }
  }
  return packageStubs;
};

const responseInjectRunFunction = (responseObj: Response, config: Config) => {
  if (!responseObj.run) return;

  const injectResponseRequire = (config: ConfigInjection) => {
    const p = require("path") as typeof path;
    const runArr = ("###PATH###" as string).split(".");
    const fnName = runArr[1];

    const db = "###DB###";
    const pathBase = "###BASE###";
    const fnPath = p.join(pathBase, runArr[0]);

    if (!config.state["__requires"]) {
      config.state["__requires"] = {};
    }
    if (!config.state["__requires"][db]) {
      config.state["__requires"][db] = {};
    }
    config.state["__requires"][db][fnPath] = 1;

    const fileRun = require(fnPath);
    return fileRun[fnName](config);
  };

  const r = injectResponseRequire.toString().replace("###BASE###", config.stubsFolder.replace(/\\/g, "\\\\"));
  const injectResponse = r.replace("###PATH###", responseObj.run).replace("###DB###", config.memDB);

  delete responseObj.run;
  responseObj.inject = injectResponse;
};

const extendModuleBehavior = (stubsModule: StubsModule, config: Config) => {
  let refInject = { run: config.globalRun, inject: "()=>{}" };
  responseInjectRunFunction(refInject, config);

  const decorate = refInject.inject;

  for (const name in stubsModule) {
    const packageStubs: StubCollection = stubsModule[name];
    packageExtendBehavior(packageStubs, decorate, { wait: config.apiTimeout }, name);
  }
  return stubsModule;
};

function objStringify(obj: any, prefix = "_!@#Ev#@!_") {
  return JSON.stringify(obj, function (key, value) {
    if (value instanceof Function || typeof value == "function" || value instanceof RegExp) {
      return prefix + value;
    }
    return value;
  });
}

function objParse(str: string, prefix = "_!@#Ev#@!_") {
  return JSON.parse(str, function (key, value) {
    if (typeof value != "string") {
      return value;
    }
    if (value.length < prefix.length) {
      return value;
    }
    if (prefix && value.substring(0, prefix.length) === prefix) {
      return eval("(" + value.slice(10) + ")");
    }
    return value;
  });
}

export {
  loadConfig,
  responseExtendBehavior,
  stubExtendBehavior,
  packageExtendBehavior,
  packageBaseURL,
  extendModuleBehavior,
  objStringify,
  objParse,
};
