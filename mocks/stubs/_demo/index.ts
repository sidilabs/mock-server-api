//inject could be used on predicates where it should returns true or false if the request will match the stub
//config.request:  { the entiry request object }
//config.logger:  { info(), warn(), error() }
//config.state: { initially empty shared state object, is global within all stubs of an imposter }

import { ConfigInjection, StubCollection } from "../../@types";

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
  config.state.demo = config.state.demo || { counter: 0 };
  config.state.demo.counter += 1;
  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ count: config.state.demo.counter }),
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

function injectResponse4(config: ConfigInjection) {
  config.response.statusCode = 240;
  config.response.headers = { "Content-Type": "application/json" };
  config.response.body = { ...(config.response.body as {}), request: config.request };
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
            decorate: injectResponse4.toString(),
          },
        },
      ],
    },
  },
};
