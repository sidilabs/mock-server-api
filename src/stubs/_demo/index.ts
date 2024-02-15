//inject could be used on predicates where it should returns true or false if the request will match the stub
//config.request:  { the entiry request object }
//config.logger:  { info(), warn(), error() }
//config.state: { initially empty shared state object, is global within all stubs of an imposter }

import { ConfigInjection, StubCollection } from "../../@types";
import path from "path";

//only on response injection
//config.callback(value) =>  for async requests
const injectRequest = (config: ConfigInjection) => {
  function hasXMLProlog() {
    return config.request.body.indexOf("<?xml") === 0;
  }

  if (config.request.headers["Content-Type"] === "application/xml") {
    return !hasXMLProlog();
  } else {
    return hasXMLProlog();
  }
};

const injectResponse = (config: ConfigInjection) => {
  var _ = require("lodash");

  const result = _.partition([1, 2, 3, 4], (n: number) => n % 2);
  config.state.demo = config.state.demo || { counter: 0 };
  config.state.demo.counter += 1;
  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      count: config.state.demo.counter,
      result,
    }),
  };
};

const injectResponseOverwrite = (config: ConfigInjection) => {
  config.state.killState = 1;
  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config.state),
  };
};

const injectResponse2 = (config: ConfigInjection) => {
  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config.state),
  };
};

const injectResponse3 = (config: ConfigInjection) => {
  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config.request),
  };
};

function injectAllConfig(config: any) {
  config.response.statusCode = 240;
  config.response.headers = { "Content-Type": "application/json" };
  config.response.body = { body: { ...(config.response.body as {}) }, request: config.request };

  config.logger.warn(JSON.stringify(Object.keys(config)));
  config.logger.warn("response:", JSON.stringify(config.response));
  config.logger.warn("logger keys:", JSON.stringify(Object.keys(config.logger)));
  config.logger.warn("logger scopePrefix:", config.logger.scopePrefix.toString());
  config.logger.warn("logger withScope:", config.logger.withScope.toString());
  config.logger.warn("logger changeScope:", config.logger.changeScope.toString());
  config.logger.warn("logger baseLogger keys:", JSON.stringify(Object.keys(config.logger.baseLogger)));
  config.logger.warn("logger debug:", config.logger.debug.toString());

  config.logger.warn("requestFrom:", config.requestFrom);
  config.logger.warn("method:", config.method);
  config.logger.warn("path:", config.path);
  config.logger.warn("query:", JSON.stringify(config.query));
  config.logger.warn("headers:", JSON.stringify(config.headers));
  config.logger.warn("body:", JSON.stringify(config.body));
  config.logger.warn("ip:", config.ip);
}

export const stubs: StubCollection = {
  counter: {
    stub: {
      predicates: [{ equals: { method: "GET", path: "/_demo/counter" } }],
      responses: [{ inject: injectResponse.toString() }],
    },
  },
  killState: {
    stub: {
      predicates: [{ equals: { method: "GET", path: "/_demo/killState" } }],
      responses: [{ inject: injectResponseOverwrite.toString() }],
    },
  },
  injectRequest: {
    stub: {
      predicates: [{ equals: { method: "GET", path: "/_demo" } }, { inject: injectRequest.toString() }],
      responses: [{ is: { body: "all predicates OK including the injected one" } }],
    },
  },

  allState: {
    stub: {
      predicates: [{ equals: { method: "GET", path: "/_demo/allState" } }],
      responses: [{ inject: injectResponse2.toString() }],
    },
  },

  allRequest: {
    stub: {
      predicates: [{ equals: { method: "GET", path: "/_demo/allRequest" } }],
      responses: [{ inject: injectResponse3.toString() }],
    },
  },

  allConfig: {
    stub: {
      predicates: [{ equals: { method: "GET", path: "/_demo/allConfig" } }],
      responses: [
        {
          is: { statusCode: 200, body: { test: 1 } },
          _behaviors: {
            decorate: injectAllConfig.toString(),
          },
        },
      ],
    },
  },
};
