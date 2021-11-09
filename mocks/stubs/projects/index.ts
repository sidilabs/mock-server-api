const projectList = require("./projectList.json");
const project = require("./project.json");

import { packageBaseURL } from "../../utils";
import { ADMIN } from "../../constants";
import { StubCollection } from "../../@types";

export const stubs: StubCollection = packageBaseURL(ADMIN, {
  projectList: {
    stub: {
      predicates: [{ equals: { method: "GET", path: "/project" } }],
      responses: [{ is: { body: projectList } }],
    },
  },
  project: {
    stub: {
      predicates: [{ matches: { method: "GET", path: "/project/\\d+" } }],
      responses: [{ is: { body: project } }],
    },
  },
  projectSubmit: {
    stub: {
      predicates: [
        {
          or: [
            { matches: { method: "POST", path: "/project" } },
            { matches: { method: "PUT", path: "/project/\\d+" } },
            { matches: { method: "DELETE", path: "/project/\\d+" } },
          ],
        },
      ],
      responses: [{ is: { statusCode: 200 } }],
    },
  },
});
