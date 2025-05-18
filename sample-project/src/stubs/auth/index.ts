import { ConfigInjection, StubCollection, packageBaseURL } from "mock-server-api";
import { ADMIN } from "../../constants";

import permissionList from "./permissionList.json";

const onLogout = (config: ConfigInjection) => {
  const types = {
    number: true,
    string: true,
    boolean: true,
  } as any;
  const obj = {} as any;
  Object.entries(config).forEach(([key, value]) => {
    if (typeof value === "function") {
      obj[key] = value.toString();
    } else if (types[typeof value]) {
      obj[key] = value;
    } else {
      Object.entries(value).forEach(([key2, value2]) => {
        if (!value?.constructor) {
          obj[key] = null;
        } else {
          if (Array.isArray(value)) {
            obj[key] = obj[key] || [];
          } else {
            obj[key] = obj[key] || {};
          }
          if (key2 === "baseLogger") return;
          if (typeof value2 === "function") {
            obj[key][key2] = value2.toString();
          } else if (types[typeof value2]) {
            obj[key][key2] = value2;
          } else {
            Object.entries(value2).forEach(([key3, value3]) => {
              if (!value2?.constructor) {
                obj[key][key2] = null;
              } else {
                if (Array.isArray(value2)) {
                  obj[key][key2] = obj[key][key2] || [];
                } else {
                  obj[key][key2] = obj[key][key2] || {};
                }

                if (types[typeof value3]) {
                  obj[key][key2][key3] = (value3 as any).toString();
                } else {
                  obj[key][key2][key3] = value3;
                }
              }
            });
          }
        }
      });
    }
  });
  config.logger.info(JSON.stringify(obj));
  const headers = config.request.headers;
  config.response.headers = config.response.headers || {};
  config.response.headers = {
    ...config.response.headers,
    // location: `${headers.Referer}login`,
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
          behaviors: [{ decorate: onLogout }],
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
