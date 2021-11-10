const userList = require("./userList.json");
const user = require("./user.json");

import { packageBaseURL } from "../../utils";
import { ADMIN } from "../../constants";
import { StubCollection } from "../../@types";

export const stubs: StubCollection = packageBaseURL(ADMIN, {
  userList: {
    stub: {
      predicates: [{ equals: { method: "GET", path: "/user" } }],
      responses: [{ is: { body: userList } }],
    },
  },
  user: {
    stub: {
      predicates: [{ matches: { method: "GET", path: "/user/\\d+" } }],
      responses: [{ is: { body: user } }],
    },
  },
  userSubmit: {
    stub: {
      predicates: [{ matches: { method: "PUT", path: "/user/\\d+$" } }],
      responses: [{ is: { statusCode: 200 } }],
    },
  },
});
