const fs = require("fs");
const path = require("path");
const cors = require("./cors");

const { packageExtendBehavior, packageBaseURL } = require("../utils");
const { config, imposter } = require("../mconfig");

const extendBehavior = (all) => {
  let headers = { ...imposter.defaultResponse.headers };
  delete headers["Mountebank-Id"];
  let strHeaders = JSON.stringify(headers);

  const decorate = ((config) => {
    config.response.statusCode = config.response.statusCode || 200;
    const headers = config.response.headers || {};
    let a = Math.floor(Math.random() * 10);
    let b = Math.floor(Math.random() * 10);
    let c = Math.floor(Math.random() * 10);
    const defaultHeaders = "#####";
    config.response.headers = {
      ...headers,
      ...defaultHeaders,
      _csrf: `${a}${b}${c}a001e-1c45-4c33-853f-643f9bbb0bad`,
    };
  })
    .toString()
    .replace("'#####'", strHeaders);

  for (const name in all) {
    const packageStubs = all[name];
    packageExtendBehavior(packageStubs, decorate, { wait: config.apiTimeout }, name);
  }
  return all;
};

const loadStubs = () => {
  const directory = config.stubsFolder;
  const dirs = fs.readdirSync(directory).filter((file) => fs.lstatSync(path.resolve(directory, file)).isDirectory());
  const packages = dirs.map((dir) => {
    const packageConfig = require("./" + dir);
    if (packageConfig.baseUrl) {
      return [dir, packageBaseURL(packageConfig.stubs)];
    } else {
      return [dir, packageConfig.stubs];
    }
  });

  return Object.fromEntries(packages);
};

module.exports = {
  ...extendBehavior({ cors, ...loadStubs() }),
};
