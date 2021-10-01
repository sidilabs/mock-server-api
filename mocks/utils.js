const log = require("fancy-log");

const responseExtendBehavior = (response, decorate, behavior = {}, identifier = "") => {
  if (response) {
    let oldDecorator = "()=>{}";
    let oldBehavior = { decorate: oldDecorator };
    if (response._behaviors) {
      oldBehavior = response._behaviors;
      if (response._behaviors.decorate) {
        oldDecorator = response._behaviors.decorate;
      }
    }
    let newBehavior = { ...oldBehavior, ...behavior };
    let addIdentifier = (config) => {
      const headers = config.response.headers || {};
      config.response.headers = {
        "Mountebank-Id": "####",
        ...headers,
      };
    };
    let addId = identifier ? addIdentifier.toString().replace("####", identifier) : "()=>{}";

    newBehavior.decorate = `(__c__)=>{\n (${oldDecorator.toString()})(__c__);\n (${addId.toString()})(__c__);\n (${decorate.toString()})(__c__) }`;
    response._behaviors = newBehavior;
  }
};

const stubExtendBehavior = (stub, decorate, behavior, identifier) => {
  for (let response of stub.responses || [{}]) {
    responseExtendBehavior(response, decorate, behavior, identifier);
  }
};

const packageExtendBehavior = (packageStubs, decorate, behavior, pkgName = "") => {
  for (let pkgItem in packageStubs) {
    const data = packageStubs[pkgItem];
    stubExtendBehavior(data.stub, decorate, behavior, pkgName && pkgName + ":" + pkgItem);
  }
};

const predicateBaseURL = (url, predicateObj, n = 0) => {
  for (let i in predicateObj) {
    const path = predicateObj[i].path;
    if (path) {
      predicateObj[i].path = `${url}${path}`;
    } else {
      const predicateGroup = predicateObj[i];
      if (predicateGroup instanceof Array) {
        for (let j in predicateGroup) {
          predicateBaseURL(url, predicateGroup[j], 1);
        }
      }
    }
  }
};

const packageBaseURL = (url, packageStubs) => {
  for (let i in packageStubs) {
    const data = packageStubs[i];
    for (let r in data.stub.predicates) {
      let predicate = data.stub.predicates[r];
      predicateBaseURL(url, predicate);
    }
  }
  return packageStubs;
};

module.exports = {
  responseExtendBehavior,
  stubExtendBehavior,
  packageExtendBehavior,
  packageBaseURL,
};
