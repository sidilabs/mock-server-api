const projectList = require("./projectList.json");
const project = require("./project.json");
const projectModuleList = require("./projectModuleList.json");

import { packageBaseURL } from "../../utils";
import { ADMIN } from "../../constants";
import { ApiCollection, ConfigInjection, StubCollection } from "../../@types";
import { ConfigList, QueryFilterMap } from "../../api-model/list-total";

export const apis: ApiCollection = {
  project: {
    model: "list-total",
    api: "/project",
    state: "project",
    data: projectList.list,
    config: {
      fields: {
        created: {
          methods: ["POST"],
          callback: () => new Date().getTime() / 1000,
        },
        updated: {
          methods: ["PUT"],
          callback: () => new Date().getTime() / 1000,
        },
      },
    } as ConfigList,
  },
  projectModule: {
    api: "/project/:projectId/module",
    dataApi: "/project/module",
    data: projectModuleList,

    state: "projectModule",
    config: {
      urlParams: {
        ":projectId": ["LIST"],
      },
      fields: {
        created: {
          methods: ["POST"],
          callback: () => new Date().getTime() / 1000,
        },
        updated: {
          methods: ["PUT"],
          callback: () => new Date().getTime() / 1000,
        },
      },
      query: {
        applicationName: ["name", "CONTAINS"],
        status: "CONTAINS",
        created: (list, value, config) => {
          return list.filter((item) => item.created == value);
        },
        sort: (list, value, config) => {
          const result = [...list];
          const order = config.request.query["order"] || "asc";
          result.sort((a, b) => {
            if (order == "asc") {
              return a[value] > b[value] ? 1 : a[value] == b[value] ? 0 : -1;
            } else {
              return a[value] < b[value] ? 1 : a[value] == b[value] ? 0 : -1;
            }
          });
          return list;
        },
        offset: (list, value, config) => {
          const size = +(config.request.query["size"] || "10");
          return list.slice(value, value + size);
        },
      },
      queryPriority: {
        sort: 6,
        offset: 10,
      },
    } as ConfigList,
  },
};
