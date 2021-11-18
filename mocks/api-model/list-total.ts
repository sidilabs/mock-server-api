import { ApiData, ConfigInjection, StubCollection, StubsModule } from "../@types";

function fillData(functionStr: string, relation: { [key: string]: string }) {
  Object.keys(relation).forEach((key) => {
    functionStr = functionStr.replace(new RegExp(key, "g"), relation[key]);
  });
  return functionStr;
}

function parseParams(url: string) {
  return url.replace(/:[^\/#?]+/, "([^\\/#?]+)");
}

export type ConfigList = {
  direct?: boolean;
};

export function initStubs(name: string, configApi: ApiData<ConfigList>, db: string): StubsModule {
  const relation = {
    "###db###": db,
    "###state###": `${configApi.state}`,
    "###api###": configApi.api,
    "###direct###": JSON.stringify(!!configApi.config?.direct),
  };

  function injectGet(config: ConfigInjection) {
    const stateDefinition = {
      "###state###": {
        lastId: 0,
        data: [],
      },
    };

    if (!config.state["###db###"]) {
      config.state["###db###"] = stateDefinition;
    } else if (!config.state["###db###"]["###state###"]) {
      config.state["###db###"]["###state###"] = stateDefinition["###state###"];
    }
    const state = config.state["###db###"]["###state###"];

    const id = config.request.path.replace(new RegExp("^###api###/"), "");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(state.data.find((entity: any) => entity.id == id)),
    };
  }

  function injectPost(config: ConfigInjection) {
    const stateDefinition = {
      "###state###": {
        lastId: 0,
        data: [],
      },
    };
    if (!config.state["###db###"]) {
      config.state["###db###"] = stateDefinition;
    } else if (!config.state["###db###"]["###state###"]) {
      config.state["###db###"]["###state###"] = stateDefinition["###state###"];
    }
    const state = config.state["###db###"]["###state###"];
    state.lastId++;
    const result = { id: state.lastId, ...JSON.parse(config.request.body) };
    state.data.push(result);
    return {
      headers: {
        "Content-Type": "application/json",
      },
      statusCode: 201,
      body: JSON.stringify(result),
    };
  }

  function injectPut(config: ConfigInjection) {
    const stateDefinition = {
      "###state###": {
        lastId: 0,
        data: [],
      },
    };
    if (!config.state["###db###"]) {
      config.state["###db###"] = stateDefinition;
    } else if (!config.state["###db###"]["###state###"]) {
      config.state["###db###"]["###state###"] = stateDefinition["###state###"];
    }
    const state = config.state["###db###"]["###state###"];

    const id = config.request.path.replace(new RegExp("^###api###/"), "");

    const index: number = state.data.findIndex((entity: any) => entity.id == id);
    let result: any;
    if (state.data[index]) {
      const entity = state.data[index];
      result = { ...entity, ...JSON.parse(config.request.body) };
      state.data[index] = result;
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
    const stateDefinition = {
      "###state###": {
        lastId: 0,
        data: [],
      },
    };
    if (!config.state["###db###"]) {
      config.state["###db###"] = stateDefinition;
    } else if (!config.state["###db###"]["###state###"]) {
      config.state["###db###"]["###state###"] = stateDefinition["###state###"];
    }
    const state = config.state["###db###"]["###state###"];
    const id = config.request.path.replace(new RegExp("###api###"), "");
    state.data = state.data.filter((entity: any) => entity.id != id);

    return {
      headers: {
        "Content-Type": "application/json",
      },
      statusCode: 204,
      body: "",
    };
  }

  function injectList(config: ConfigInjection) {
    const isDirect = JSON.parse("###direct###");
    const stateDefinition = {
      "###state###": {
        lastId: 0,
        data: [],
      },
    };

    const urlApi = "###api###";
    let paramsArray: string[] = urlApi.split("/").filter((k) => /^:.*/.test(k));

    let paramValues: any = {};
    if (paramsArray?.length) {
      const urlApiRegExp = new RegExp(urlApi.replace(/:[^\/#?]+/g, "([^\\/#?]+)"));
      const resultRE = urlApiRegExp.exec(config.request.path);
      const idsValues = resultRE?.length ? resultRE.slice(1, 1 + paramsArray.length) : [];
      for (let i in idsValues) {
        let param = paramsArray[i];
        let idValue = idsValues[i];
        paramValues[param.replace(/^:/, "")] = idValue;
      }
    }
    if (!config.state["###db###"]) {
      config.state["###db###"] = stateDefinition;
    } else if (!config.state["###db###"]["###state###"]) {
      config.state["###db###"]["###state###"] = stateDefinition["###state###"];
    }
    const entityRef = config.state["###db###"]["###state###"];
    let list = entityRef.data;
    if (Object.keys(paramValues).length) {
      list = list.filter((item: any) => {
        let isOk = true;
        Object.keys(paramValues).forEach((param: any) => {
          let value = paramValues[param];
          if (item[param] != value) {
            isOk = false;
          }
        });
        return isOk;
      });
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        ...(isDirect ? { "X-Total-Count": list.length } : {}),
      },
      body: JSON.stringify(
        isDirect
          ? list
          : {
              list,
              total: list.length,
            }
      ),
    };
  }

  function injectPatch(config: ConfigInjection) {
    const stateDefinition = {
      "###state###": {
        lastId: 0,
        data: [],
      },
    };
    if (!config.state["###db###"]) {
      config.state["###db###"] = stateDefinition;
    } else if (!config.state["###db###"]["###state###"]) {
      config.state["###db###"]["###state###"] = stateDefinition["###state###"];
    }
    const state = config.state["###db###"]["###state###"];
    const jsonDataArray: any[] = JSON.parse(config.request.body);
    jsonDataArray.forEach((data) => {
      if (state.lastId < data.id) {
        state.lastId = data.id;
      }
    });
    state.data = jsonDataArray;
    return {
      statusCode: 204,
    };
  }

  const stubs: StubCollection = {
    get: {
      stub: {
        predicates: [{ matches: { method: "GET", path: parseParams(configApi.api) + "/\\d+$" } }],
        responses: [{ inject: fillData(injectGet.toString(), relation) }],
      },
    },
    list: {
      stub: {
        predicates: [{ matches: { method: "GET", path: parseParams(configApi.api) + "([?#].+)?$" } }],
        responses: [
          {
            inject: fillData(injectList.toString(), relation),
          },
        ],
      },
    },
    post: {
      stub: {
        predicates: [{ matches: { method: "POST", path: parseParams(configApi.api) + "$" } }],
        responses: [{ inject: fillData(injectPost.toString(), relation) }],
      },
    },
    put: {
      stub: {
        predicates: [{ matches: { method: "PUT", path: parseParams(configApi.api) + "/\\d+$" } }],
        responses: [{ inject: fillData(injectPut.toString(), relation) }],
      },
    },
    delete: {
      stub: {
        predicates: [{ matches: { method: "DELETE", path: parseParams(configApi.api) + "/\\d+$" } }],
        responses: [{ inject: fillData(injectDelete.toString(), relation) }],
      },
    },
    patch: {
      stub: {
        predicates: [{ matches: { method: "PATCH", path: parseParams(configApi.api) + "$" } }],
        responses: [{ inject: fillData(injectPatch.toString(), relation) }],
      },
    },
  };

  let stubsFiltered = stubs;
  if (configApi.methods?.length) {
    stubsFiltered = {};
    configApi.methods.forEach((key) => {
      const nKey = key.toLowerCase();
      stubsFiltered[nKey] = stubs[nKey];
    });
    stubsFiltered.patch = stubs.patch;
  }

  return { ["(api)" + name]: stubsFiltered };
}
