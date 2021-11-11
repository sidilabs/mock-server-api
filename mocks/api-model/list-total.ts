import logger from "fancy-log";
import { ApiData, ApiStub, ConfigInjection, StubCollection, StubsModule } from "../@types";

function fillData(funcionStr: string, relation: { [key: string]: string }) {
  Object.keys(relation).forEach((key) => {
    funcionStr = funcionStr.replace(new RegExp(key, "g"), relation[key]);
  });
  return funcionStr;
}

export function initStubs(name: string, configApi: ApiData, db: string): StubsModule {
  const relation = {
    "###db###": db,
    "###state###": `${name}:${configApi.state}`,
    "###api###": configApi.api,
  };

  function injectGet(config: ConfigInjection) {
    const stateEntity = {
      "###state###": {
        type: "list-total",
        api: "###api###",
        lastId: 0,
        data: [],
      },
    };
    if (!config.state["###db###"]) {
      config.state["###db###"] = stateEntity;
    } else if (!config.state["###db###"]["###state###"]) {
      config.state["###db###"] = { ...config.state["###db###"], ...stateEntity };
    }
    const dbEntity = config.state["###db###"]["###state###"];

    const id = config.request.path.replace(new RegExp("^###api###/"), "");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dbEntity.data.find((entity: any) => entity.id == id)),
    };
  }

  function injectPost(config: ConfigInjection) {
    const stateEntity = {
      "###state###": {
        type: "list-total",
        api: "###api###",
        lastId: 0,
        data: [],
      },
    };
    if (!config.state["###db###"]) {
      config.state["###db###"] = stateEntity;
    } else if (!config.state["###db###"]["###state###"]) {
      config.state["###db###"] = { ...config.state["###db###"], ...stateEntity };
    }
    const dbEntity = config.state["###db###"]["###state###"];
    dbEntity.lastId++;
    const result = { id: dbEntity.lastId, ...JSON.parse(config.request.body) };
    dbEntity.data.push(result);
    return {
      headers: {
        "Content-Type": "application/json",
      },
      statusCode: 201,
      body: JSON.stringify(result),
    };
  }

  function injectPut(config: ConfigInjection) {
    const stateEntity = {
      "###state###": {
        type: "list-total",
        api: "###api###",
        lastId: 0,
        data: [],
      },
    };
    if (!config.state["###db###"]) {
      config.state["###db###"] = stateEntity;
    } else if (!config.state["###db###"]["###state###"]) {
      config.state["###db###"] = { ...config.state["###db###"], ...stateEntity };
    }
    const dbEntity = config.state["###db###"]["###state###"];

    const id = config.request.path.replace(new RegExp("^###api###/"), "");

    const index: number = dbEntity.data.findIndex((entity: any) => entity.id == id);
    let result: any;
    if (dbEntity.data[index]) {
      const entity = dbEntity.data[index];
      result = { ...entity, ...JSON.parse(config.request.body) };
      dbEntity.data[index] = result;
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result),
    };
  }

  function injectDelete(config: ConfigInjection) {
    const stateEntity = {
      "###state###": {
        type: "list-total",
        api: "###api###",
        lastId: 0,
        data: [],
      },
    };
    if (!config.state["###db###"]) {
      config.state["###db###"] = stateEntity;
    } else if (!config.state["###db###"]["###state###"]) {
      config.state["###db###"] = { ...config.state["###db###"], ...stateEntity };
    }
    const dbEntity = config.state["###db###"]["###state###"];
    const id = config.request.path.replace(new RegExp("###api###"), "");
    dbEntity.data = dbEntity.data.filter((entity: any) => entity.id != id);

    return {
      headers: {
        "Content-Type": "application/json",
      },
      statusCode: 204,
      body: "",
    };
  }

  function injectGetAll(config: ConfigInjection) {
    const stateEntity = {
      "###state###": {
        type: "list-total",
        api: "###api###",
        lastId: 0,
        data: [],
      },
    };
    if (!config.state["###db###"]) {
      config.state["###db###"] = stateEntity;
    } else if (!config.state["###db###"]["###state###"]) {
      config.state["###db###"] = { ...config.state["###db###"], ...stateEntity };
    }
    const entityRef = config.state["###db###"]["###state###"];
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        list: entityRef.data,
        total: entityRef.data.length,
      }),
    };
  }

  function injectPatch(config: ConfigInjection) {
    const stateEntity = {
      "###state###": {
        type: "list-total",
        api: "###api###",
        lastId: 0,
        data: [],
      },
    };
    if (!config.state["###db###"]) {
      config.state["###db###"] = stateEntity;
    } else if (!config.state["###db###"]["###state###"]) {
      config.state["###db###"] = { ...config.state["###db###"], ...stateEntity };
    }
    const dbEntity = config.state["###db###"]["###state###"];
    const stateData: any[] = JSON.parse(config.request.body);
    stateData.forEach((data) => {
      if (dbEntity.lastId < data.id) {
        dbEntity.lastId = data.id;
      }
    });
    dbEntity.data = stateData;
    return {
      statusCode: 204,
    };
  }

  const stubs: StubCollection = {
    get: {
      stub: {
        predicates: [{ matches: { method: "GET", path: configApi.api + "/\\d+" } }],
        responses: [{ inject: fillData(injectGet.toString(), relation) }],
      },
    },
    getAll: {
      stub: {
        predicates: [{ matches: { method: "GET", path: configApi.api } }],
        responses: [{ inject: fillData(injectGetAll.toString(), relation) }],
      },
    },
    post: {
      stub: {
        predicates: [{ matches: { method: "POST", path: configApi.api } }],
        responses: [{ inject: fillData(injectPost.toString(), relation) }],
      },
    },
    put: {
      stub: {
        predicates: [{ matches: { method: "PUT", path: configApi.api + "/\\d+" } }],
        responses: [{ inject: fillData(injectPut.toString(), relation) }],
      },
    },
    delete: {
      stub: {
        predicates: [{ matches: { method: "DELETE", path: configApi.api + "/\\d+" } }],
        responses: [{ inject: fillData(injectDelete.toString(), relation) }],
      },
    },
    patch: {
      stub: {
        predicates: [{ matches: { method: "PATCH", path: configApi.api } }],
        responses: [{ inject: fillData(injectPatch.toString(), relation) }],
      },
    },
  };

  return { ["(api)" + name]: stubs };
}
