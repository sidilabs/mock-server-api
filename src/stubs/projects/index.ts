import projectList from "./projectList.json";
import projectModuleList from "./projectModuleList.json";

import { ApiCollection } from "../../@types";
import { ConfigList } from "../../api-model/list-total";
import { sort, offset } from "../../api-model/list-total/utils";

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
      query: {
        sort: [6, sort],
        offset: [10, offset],
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
        applicationName: [, ["name", "CONTAINS"]],
        status: [, "CONTAINS"],
        created: [
          ,
          (list, value, config) => {
            return list.filter((item) => item.created == value);
          },
        ],
      },
    } as ConfigList,
  },
};
