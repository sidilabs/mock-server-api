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

export type FieldGenerator = {
  methods?: string[];
  callback: (response: any, config: ConfigInjection) => any;
};

export type FieldGeneratorMap = {
  [key: string]: FieldGenerator;
};

export type ConfigList = {
  direct?: boolean;
  fields?: FieldGeneratorMap;
};

export function initStubs(name: string, configApi: ApiData<ConfigList>, db: string): StubsModule {
  let jsonFields: any = "";
  if (configApi.config?.fields) {
    const fields = configApi.config?.fields || {};
    jsonFields = Object.keys(fields).reduce((acc, fieldName: string) => {
      const generator = fields[fieldName];
      acc = {
        ...acc,
        [fieldName]: { ...generator, callback: generator.callback.toString() },
      };
      return acc;
    }, {});
  }

  const relation = {
    "###db###": db,
    "###state###": `${configApi.state}`,
    "###api###": configApi.api,
    "###direct###": JSON.stringify(!!configApi.config?.direct),
    "'###fields###'": JSON.stringify(jsonFields),
  };

  function injectGet(config: ConfigInjection) {
    config.logger.warn("config.request", JSON.stringify(config.request));
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

    let objResponse = state.data.find((entity: any) => entity.id == id);
    let fields: any = "###fields###"; /*FieldGeneratorMap*/
    if (fields) {
      fields = Object.keys(fields).reduce((acc, fieldName) => {
        let fieldGenerator: FieldGenerator = fields[fieldName];
        if (!fieldGenerator.methods || fieldGenerator.methods.includes("GET")) {
          return { ...acc, [fieldName]: { ...fieldGenerator, callback: eval(`(${fieldGenerator.callback})`) } };
        } else {
          return acc;
        }
      }, {});

      Object.keys(fields).forEach((fieldName) => {
        const generator = fields[fieldName].callback;
        objResponse = { ...objResponse, [fieldName]: generator(objResponse, config) };
      });
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(objResponse),
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
    let result = { id: state.lastId, ...JSON.parse(config.request.body) };

    let fields: any = "###fields###"; /*FieldGeneratorMap*/
    if (fields) {
      fields = Object.keys(fields).reduce((acc, fieldName) => {
        let fieldGenerator: FieldGenerator = fields[fieldName];
        if (!fieldGenerator.methods || fieldGenerator.methods.includes("POST")) {
          return { ...acc, [fieldName]: { ...fieldGenerator, callback: eval(`(${fieldGenerator.callback})`) } };
        } else {
          return acc;
        }
      }, {});

      Object.keys(fields).forEach((fieldName) => {
        const generator = fields[fieldName].callback;
        result = { ...result, [fieldName]: generator(result, config) };
      });
    }

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

      let fields: any = "###fields###"; /*FieldGeneratorMap*/
      if (fields) {
        fields = Object.keys(fields).reduce((acc, fieldName) => {
          let fieldGenerator: FieldGenerator = fields[fieldName];
          if (!fieldGenerator.methods || fieldGenerator.methods.includes("PUT")) {
            return { ...acc, [fieldName]: { ...fieldGenerator, callback: eval(`(${fieldGenerator.callback})`) } };
          } else {
            return acc;
          }
        }, {});

        Object.keys(fields).forEach((fieldName) => {
          const generator = fields[fieldName].callback;
          result = { ...result, [fieldName]: generator(result, config) };
        });
      }

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

  function injectList(config: ConfigInjection, injectState: any, logger: any, resolve: any, imposterState: any) {
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
    let list: any[] = entityRef.data;
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

    let fields: any = "###fields###"; /*FieldGeneratorMap*/
    if (list.length && fields) {
      fields = Object.keys(fields).reduce((acc, fieldName) => {
        let fieldGenerator: FieldGenerator = fields[fieldName];
        if (!fieldGenerator.methods || fieldGenerator.methods.includes("LIST")) {
          return { ...acc, [fieldName]: { ...fieldGenerator, callback: eval(`(${fieldGenerator.callback})`) } };
        } else {
          return acc;
        }
      }, {});
      list = list.map((item) => {
        let result = { ...item };
        Object.keys(fields).forEach((fieldName) => {
          const generator = fields[fieldName].callback;
          result = { ...result, [fieldName]: generator(result, config) };
        });
        return result;
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
