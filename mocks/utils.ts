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
} from "./@types";

import log from "fancy-log";
import { ImposterDefaults, MConfig } from "./mconfig";

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

const packageExtendBehavior = (
  packageStubs: StubCollection,
  decorate: FunctionString,
  behavior: Behavior,
  pkgName = ""
) => {
  for (let pkgItem in packageStubs) {
    const data = packageStubs[pkgItem];
    stubExtendBehavior(data.stub, decorate, behavior, pkgName && pkgName + ":" + pkgItem);
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
    for (let r in data.stub.predicates) {
      let predicate = data.stub.predicates[r];
      predicateBaseURL(url, predicate);
    }
  }
  return packageStubs;
};

const extendModuleBehavior = (stubsModule: StubsModule, config: MConfig, imposter: ImposterDefaults) => {
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

export { responseExtendBehavior, stubExtendBehavior, packageExtendBehavior, packageBaseURL, extendModuleBehavior };
