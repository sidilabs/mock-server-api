const userList = require("./userList.json");
const user = require("./user.json");

const { packageBaseURL } = require("../../utils");
const { ADMIN } = require("../../constants");

module.exports = {
  stubs: packageBaseURL(ADMIN, {
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
  }),
};
