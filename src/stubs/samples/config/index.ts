import { StubCollection } from "../../../@types";

import configList from "./configList.json";
import config from "./config.json";
import configResourceList from "./configResourceList.json";
import configResource from "./configResource.json";

import { packageBaseURL } from "../../../utils";
import { ADMIN } from "../../../utils/constants";

export const stubs: StubCollection = packageBaseURL(ADMIN, {
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
});
