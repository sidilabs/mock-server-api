import { ConfigInjection, StubCollection, packageBaseURL } from "mock-server-api";
import { ADMIN } from "../../constants";

import permissionList from "./permissionList.json";

const onLogout = (config: ConfigInjection) => {
  const headers = config.request.headers;
  config.response.headers = config.response.headers || {};
  config.response.headers = {
    ...config.response.headers,
    location: `${headers.Referer}login`,
  };
};

const onLogin = (config: ConfigInjection) => {
  const headers = config.request.headers;
  config.response.headers = config.response.headers || {};
  let date = new Date();
  date.setDate(date.getDate() + 1);
  config.response.headers = {
    ...config.response.headers,
    location: `${headers.Referer || "localhost:3000/"}login/redirection?code=12345&state=bff76ed1`,
    "Set-Cookie": `APP_SESSION_ID=asdfzxcv; path=/; expires=${date}`,
  };
};

export const stubs: StubCollection = packageBaseURL(ADMIN, {
  permission: {
    stub: {
      predicates: [{ matches: { method: "GET", path: "/permission" } }],
      responses: [{ is: { body: JSON.stringify(permissionList) } }],
    },
  },
  logout: {
    stub: {
      predicates: [{ matches: { method: "GET", path: "/logout" } }],
      responses: [
        {
          is: {
            statusCode: 302,
            headers: {
              "Set-Cookie": "APP_SESSION_ID=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT",
            },
          },
          behaviors: [{ decorate: onLogout.toString() }],
        },
      ],
    },
  },
  login: {
    stub: {
      predicates: [
        {
          equals: {
            method: "GET",
            path: "/login",
            query: { redirect_uri: "http://localhost:3000/login/redirection" },
          },
        },
      ],
      responses: [
        {
          is: {
            statusCode: 302,
          },
          behaviors: [{ decorate: onLogin.toString() }],
        },
      ],
    },
  },
  loginResolve: {
    stub: {
      predicates: [{ matches: { method: "GET", path: "/login/resolve" } }],
      responses: [
        {
          is: {
            statusCode: 200,
          },
          behaviors: [{ wait: 3000 }],
        },
      ],
    },
  },
});
