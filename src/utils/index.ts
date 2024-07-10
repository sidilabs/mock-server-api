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
  behavior: Behavior = {},
  identifier = ""
) => {
  if (response) {
    let oldDecorator = "()=>{}";
    let oldBehavior = { decorate: oldDecorator } as Behavior;
    if (response._behaviors) {
      oldBehavior = response._behaviors;
      if (response._behaviors.decorate) {
        oldDecorator = response._behaviors.decorate;
      }
    }

    let newBehavior = { ...oldBehavior, ...behavior };
    if (oldBehavior.wait) {
      newBehavior.wait = oldBehavior.wait;
    }
    let addIdentifier = (config: ConfigInjection) => {
      const headers = config.response.headers || {};
      config.response.headers = {
        "Mountebank-Id": "####",
        ...headers,
      };
    };
    let addId = identifier ? addIdentifier.toString().replace("####", identifier) : "()=>{}";

    newBehavior.decorate = `(__c__)=>{
       (${oldDecorator.toString()})(__c__);
       (${addId.toString()})(__c__);
       (${decorate.toString()})(__c__) }`;
    response._behaviors = newBehavior;
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

export const injectRunFunction = (packageStubs: StubCollection, baseDirectory: string) => {
  for (let i in packageStubs) {
    const data = packageStubs[i];
    for (let r in stub(data).responses) {
      let response = stub(data).responses[r];
      responseInjectRunFunction(response, baseDirectory);
    }
  }
  return packageStubs;
};

const responseInjectRunFunction = (responseObj: Response, baseDirectory: string) => {
  if (!responseObj.run) return;

  const injectResponseRequire = (config: ConfigInjection) => {
    const p = require("path") as typeof path;
    const runArr = ("###PATH###" as string).split(".");
    const fnName = runArr[1];

    const pathBase = "###BASE###";
    const fnPath = p.join(pathBase, runArr[0]);

    if (!config.state["__requires"]) {
      config.state["__requires"] = [];
    }
    config.state["__requires"].push(fnPath);

    delete require.cache[fnPath];
    const fileRun = require(fnPath);
    return fileRun[fnName](config);
  };

  const r = injectResponseRequire.toString().replace("###BASE###", baseDirectory.replace(/\\/g, "\\\\"));
  const injectResponse = r.replace("###PATH###", responseObj.run);

  delete responseObj.run;
  responseObj.inject = injectResponse;
};

const extendModuleBehavior = (stubsModule: StubsModule, config: Config, imposter: ImposterDefaults) => {
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
