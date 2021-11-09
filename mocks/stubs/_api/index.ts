import { ConfigInjection } from "../../@types";

function injectDGet(config: ConfigInjection) {
  const stateEntity = {
    entity: {
      type: "associative",
      api: "sample",
      lastId: 0,
      data: {},
    },
  };
  if (!config.state.__db__) {
    config.state.__db__ = stateEntity;
  } else if (!config.state.__db__["entity"]) {
    config.state.__db__ = { ...config.state.__db__, ...stateEntity };
  }
  const dbEntity = config.state.__db__["entity"];

  const id = config.request.path.replace(new RegExp("^/_demo/d/"), "");

  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dbEntity.data[id]),
  };
}

function injectDPost(config: ConfigInjection) {
  const stateEntity = {
    "##entity##": {
      api: "##api##",
      type: "associative",
      lastId: 0,
      data: {},
    },
  };
  if (!config.state.__db__) {
    config.state.__db__ = stateEntity;
  } else if (!config.state.__db__["##entity##"]) {
    config.state.__db__ = { ...config.state.__db__, ...stateEntity };
  }
  const dbEntity = config.state.__db__["##entity##"];
  dbEntity.lastId++;
  const result = { id: dbEntity.lastId, ...JSON.parse(config.request.body) };
  dbEntity.data[dbEntity.lastId] = result;
  return {
    headers: {
      "Content-Type": "application/json",
    },
    statusCode: 201,
    body: JSON.stringify(result),
  };
}

function injectDDelete(config: ConfigInjection) {
  const stateEntity = {
    "##entity##": {
      api: "##api##",
      type: "associative",
      lastId: 0,
      data: {},
    },
  };
  if (!config.state.__db__) {
    config.state.__db__ = stateEntity;
  } else if (!config.state.__db__["##entity##"]) {
    config.state.__db__ = { ...config.state.__db__, ...stateEntity };
  }
  const dbEntity = config.state.__db__["##entity##"];
  const id = config.request.path.replace(new RegExp("##url##"), "");
  delete dbEntity.data[id];

  return {
    headers: {
      "Content-Type": "application/json",
    },
    statusCode: 204,
    body: "",
  };
}

function injectDGetAll(config: ConfigInjection) {
  const stateEntity = {
    "##entity##": {
      type: "associative",
      api: "##api##",
      lastId: 0,
      data: {},
    },
  };
  if (!config.state.__db__) {
    config.state.__db__ = stateEntity;
  } else if (!config.state.__db__["##entity##"]) {
    config.state.__db__ = { ...config.state.__db__, ...stateEntity };
  }
  const entityRef = config.state.__db__["##entity##"];
  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      list: Object.keys(entityRef.data).map((k) => entityRef.data[k]),
      total: Object.keys(entityRef.data).length,
    }),
  };
}

export const stubs = {
  dGet: {
    stub: {
      predicates: [{ matches: { method: "GET", path: "/_demo/d/\\d+" } }],
      responses: [{ inject: injectDGet.toString() }],
    },
  },
  dGetAll: {
    stub: {
      predicates: [{ equals: { method: "GET", path: "/_demo/d" } }],
      responses: [{ inject: injectDGetAll.toString() }],
    },
  },
  dPost: {
    stub: {
      predicates: [{ equals: { method: "POST", path: "/_demo/d" } }],
      responses: [{ inject: injectDPost.toString() }],
    },
  },
  dPut: {
    stub: {
      predicates: [{ equals: { method: "PUT", path: "/_demo/d/\\d+" } }],
      responses: [{ inject: injectDPost.toString() }],
    },
  },
  dDelete: {
    stub: {
      predicates: [{ matches: { method: "DELETE", path: "/_demo/d/\\d+" } }],
      responses: [{ inject: injectDDelete.toString() }],
    },
  },
  dPatch: {
    stub: {
      predicates: [{ equals: { method: "PATCH", path: "/_demo/d" } }],
      responses: [{ inject: injectDPost.toString() }],
    },
  },
};
export const api = {
  sample: {
    state: "entity",
    path: "/_demo/d",
  },
};
