//inject could be used on predicates where it should returns true or false if the request will match the stub
//config.request:  { the entiry request object }
//config.logger:  { info(), warn(), error() }
//config.state: { initially empty shared state object, is global within all stubs of an imposter }

//only on response injection
//config.callback(value) =>  for async requests

const log = require('fancy-log');

const injectRequest = (config) => {
  function hasXMLProlog() {
    return config.request.body.indexOf('<?xml') === 0;
  }

  if (config.request.headers['Content-Type'] === 'application/xml') {
    return !hasXMLProlog();
  } else {
    return hasXMLProlog();
  }
};

const injectResponse = (config) => {
  config.state.demo = config.state.demo || { counter: 0 };
  config.state.demo.counter += 1;
  return {
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ count: config.state.demo.counter }),
  };
};

const injectResponse2 = (config) => {
  return {
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config.state),
  };
};

const injectResponse3 = (config) => {
  return {
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config.request),
  };
};

function injectResponse4(config) {
  config.response.statusCode = 240;
  config.response.headers = { 'Content-Type': 'application/json' };
  config.response.body = { ...config.response.body, request: config.request };
}

module.exports = {
  stubs: {
    counter: {
      stub: {
        predicates: [{ equals: { method: 'GET', path: '/_demo/counter' } }],
        responses: [{ inject: injectResponse.toString() }],
      },
    },
    injectRequest: {
      stub: {
        predicates: [{ equals: { method: 'GET', path: '/_demo' } }, { inject: injectRequest.toString() }],
        responses: [{ is: { body: 'all predicates OK including the injected one' } }],
      },
    },

    allState: {
      stub: {
        predicates: [{ equals: { method: 'GET', path: '/_demo/allState' } }],
        responses: [{ inject: injectResponse2.toString() }],
      },
    },

    allRequest: {
      stub: {
        predicates: [{ equals: { method: 'GET', path: '/_demo/allRequest' } }],
        responses: [{ inject: injectResponse3.toString() }],
      },
    },

    allConfig: {
      stub: {
        predicates: [{ equals: { method: 'GET', path: '/_demo/allConfig' } }],
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
  },
};
