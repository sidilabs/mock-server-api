const configList = require("./configList.json");
const config = require("./config.json");
const configResourceList = require("./configResourceList.json");
const configResource = require("./configResource.json");

const { packageBaseURL } = require("../../utils");
const { ADMIN } = require("../../constants");

module.exports = {
  stubs: packageBaseURL(ADMIN, {
    configList: {
      stub: {
        predicates: [{ equals: { method: "GET", path: "/config" } }],
        responses: [{ is: { body: configList } }],
      },
    },
    config: {
      stub: {
        predicates: [{ matches: { method: "GET", path: "/config/\\d+$" } }],
        responses: [{ is: { body: config } }],
      },
    },
    configResourceList: {
      stub: {
        predicates: [{ matches: { method: "GET", path: "/config/\\d+/resource/?(\\?.*)?$" } }],
        responses: [{ is: { body: configResourceList } }],
      },
    },
    configResource: {
      stub: {
        predicates: [{ matches: { method: "GET", path: "/config/resource/\\d+$" } }],
        responses: [{ is: { body: configResource } }],
      },
    },
    configSubmit: {
      stub: {
        predicates: [
          {
            or: [
              { matches: { method: "PUT", path: "/config/\\d+$" } },
              { matches: { method: "POST", path: "/config$" } },
            ],
          },
        ],
        responses: [{ is: { statusCode: 200 } }],
      },
    },
    configResourceSubmit: {
      stub: {
        predicates: [
          {
            or: [
              { matches: { method: "PUT", path: "/config/resource/\\d+$" } },
              { matches: { method: "POST", path: "/config/resource$" } },
            ],
          },
        ],
        responses: [{ is: { statusCode: 200 } }],
      },
    },
  }),
};
