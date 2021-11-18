import internal from 'stream';
import { ApiData, ConfigInjection, StubCollection, StubsModule } from '../@types';

function fillData(functionStr: string, relation: { [key: string]: string }) {
  Object.keys(relation).forEach((key) => {
    functionStr = functionStr.replace(new RegExp(key, 'g'), relation[key]);
  });
  return functionStr;
}

// it is an RegExp string and should contains an identifier like :id , ex.: /sample/:id/detail
export type IdRegExpString = string;

export type ConfigInternal = {
  id?: string; // default 'id'
  direct: boolean; // selects when the response on list should be an object like { list: [], total:0 } or a directly an array
  internal: {
    /* should have an identifier in the url for the internal object
     /sample/:id/detail - it would be a list of details of the sample object with id equals to the value of :id */
    apiList: IdRegExpString;
    toTarget: string; //param name that points to the target object
    paramList: string; //param name that contains the list
    targetId?: string; // default 'id'
  };
};

type Relation = {
  '###direct###': string;
  '###db###': string;
  '###state###': string;
  '###api###': string;
  '###i-api###': string;
  '###i-target###': string;
  '###i-list###': string;
};

export function initStubs(name: string, configApi: ApiData<ConfigInternal>, db: string): StubsModule {
  configApi.config = configApi.config || ({ internal: {} } as ConfigInternal);

  const relation: any = {
    '###direct###': JSON.stringify(!!configApi.config?.direct),
    '###db###': db,
    '###state###': `${configApi.state}`,
    '###api###': configApi.api,
    '###i-api###': configApi.config.internal.apiList,
    '###i-target###': configApi.config.internal.toTarget,
    '###i-list###': configApi.config.internal.paramList,
  };
  if (configApi.config.id) {
    relation['###id###'] = configApi.config.id;
  }
  if (configApi.config.internal.targetId) {
    relation['###i-id###'] = configApi.config.internal.targetId;
  }

  function injectGet(config: ConfigInjection) {
    const stateDefinition = {
      '###state###': {
        lastId: 0,
        data: [] as any[],
        internal: {
          lastId: 0,
          data: {} as { [key: string]: any },
        },
      },
    };
    if (!config.state['###db###']) {
      config.state['###db###'] = stateDefinition;
    } else if (!config.state['###db###']['###state###']) {
      config.state['###db###']['###state###'] = stateDefinition['###state###'];
    } else if (!config.state['###db###']['###state###'].internal) {
      config.state['###db###']['###state###'].internal = stateDefinition['###state###'].internal;
    }
    const state = config.state['###db###']['###state###'];

    const id = config.request.path.replace(new RegExp('^###api###/'), '');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state.internal.data[id]),
    };
  }

  function injectPost(config: ConfigInjection) {
    const stateDefinition = {
      '###state###': {
        lastId: 0,
        data: [] as any[],
        internal: {
          lastId: 0,
          data: {} as { [key: string]: any },
        },
      },
    };
    if (!config.state['###db###']) {
      config.state['###db###'] = stateDefinition;
    } else if (!config.state['###db###']['###state###']) {
      config.state['###db###']['###state###'] = stateDefinition['###state###'];
    } else if (!config.state['###db###']['###state###'].internal) {
      config.state['###db###']['###state###'].internal = stateDefinition['###state###'].internal;
    }
    const state = config.state['###db###']['###state###'];
    const stateInternal = state.internal;
    const dataJson = JSON.parse(config.request.body);
    const idInternal = dataJson['###i-target###'];
    const stateData = state.data.find((entity: any) => entity.id == idInternal);
    if (!stateData) {
      return {
        statusCode: 404,
        body: 'Entity target not found',
      };
    }
    stateInternal.lastId++;
    const result = { id: stateInternal.lastId, ...dataJson };
    stateInternal.data[stateInternal.lastId] = result;
    stateData['###i-list###'].push(result);
    return {
      headers: {
        'Content-Type': 'application/json',
      },
      statusCode: 201,
      body: JSON.stringify(result),
    };
  }

  function injectPut(config: ConfigInjection) {
    const stateDefinition = {
      '###state###': {
        lastId: 0,
        data: [] as any[],
        internal: {
          lastId: 0,
          data: {} as { [key: string]: any },
        },
      },
    };
    if (!config.state['###db###']) {
      config.state['###db###'] = stateDefinition;
    } else if (!config.state['###db###']['###state###']) {
      config.state['###db###']['###state###'] = stateDefinition['###state###'];
    } else if (!config.state['###db###']['###state###'].internal) {
      config.state['###db###']['###state###'].internal = stateDefinition['###state###'].internal;
    }
    const state = config.state['###db###']['###state###'];
    const stateInternal = state.internal;
    const dataJson = JSON.parse(config.request.body);
    const idInternal = dataJson['###i-target###'];

    const stateData = state.data.find((entity: any) => entity.id == idInternal);
    if (!stateData) {
      return {
        statusCode: 404,
        body: 'Entity target not found',
      };
    }
    const id = config.request.path.replace(new RegExp('^###api###/'), '');

    let result: any;
    if (stateInternal.data[id]) {
      const entity = stateInternal.data[id];
      const jsonData = JSON.parse(config.request.body);
      Object.keys(jsonData).forEach((key) => {
        entity[key] = jsonData[key];
      });
      result = entity;
    } else {
      return {
        statusCode: 404,
        body: 'Entity not found',
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    };
  }

  function injectDelete(config: ConfigInjection) {
    const stateDefinition = {
      '###state###': {
        lastId: 0,
        data: [] as any[],
        internal: {
          lastId: 0,
          data: {} as { [key: string]: any },
        },
      },
    };
    if (!config.state['###db###']) {
      config.state['###db###'] = stateDefinition;
    } else if (!config.state['###db###']['###state###']) {
      config.state['###db###']['###state###'] = stateDefinition['###state###'];
    } else if (!config.state['###db###']['###state###'].internal) {
      config.state['###db###']['###state###'].internal = stateDefinition['###state###'].internal;
    }
    const state = config.state['###db###']['###state###'];
    const stateInternal = state.internal;
    const id = config.request.path.replace(new RegExp('###api###'), '');
    const targetId = stateInternal.data[id]['###i-target###'];

    const stateData = state.data.find((entity: any) => entity.id == targetId);
    stateData['###i-list###'] = stateData['###i-list###'].filter((item: any) => item.id != id);
    delete stateInternal.data[id];
    return {
      headers: {
        'Content-Type': 'application/json',
      },
      statusCode: 204,
    };
  }

  function injectList(config: ConfigInjection) {
    const isDirect = JSON.parse('###direct###');
    const stateDefinition = {
      '###state###': {
        lastId: 0,
        data: [] as any[],
        internal: {
          lastId: 0,
          data: {} as { [key: string]: any },
        },
      },
    };
    if (!config.state['###db###']) {
      config.state['###db###'] = stateDefinition;
    } else if (!config.state['###db###']['###state###']) {
      config.state['###db###']['###state###'] = stateDefinition['###state###'];
    } else if (!config.state['###db###']['###state###'].internal) {
      config.state['###db###']['###state###'].internal = stateDefinition['###state###'].internal;
    }

    const state = config.state['###db###']['###state###'];

    const regexInternalApi = new RegExp('###i-api###'.replace(/:[^\/#?]+/, '([^\\/#?]+)'));
    const result = regexInternalApi.exec(config.request.path);
    const id = result ? result[1] : null;

    const dbEntity = state.data.find((entity: any) => entity.id == id);

    if (dbEntity) {
      const list = dbEntity['###i-list###'] || [];

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          ...(isDirect ? { 'X-Total-Count': list.length } : {}),
        },
        body: JSON.stringify(
          isDirect
            ? list
            : {
                list,
                total: list.length,
              },
        ),
      };
    } else {
      return {
        statusCode: 404,
        body: 'Entity target not found',
      };
    }
  }

  function injectPatch(config: ConfigInjection) {
    const stateDefinition = {
      '###state###': {
        lastId: 0,
        data: [] as any[],
        internal: {
          lastId: 0,
          data: {} as { [key: string]: any },
        },
      },
    };
    if (!config.state['###db###']) {
      config.state['###db###'] = stateDefinition;
    } else if (!config.state['###db###']['###state###']) {
      config.state['###db###']['###state###'] = stateDefinition['###state###'];
    } else if (!config.state['###db###']['###state###'].internal) {
      config.state['###db###']['###state###'].internal = stateDefinition['###state###'].internal;
    }
    const state = config.state['###db###']['###state###'];
    const stateInternal = state.internal;
    const jsonData: any[] = JSON.parse(config.request.body);

    jsonData.forEach((data) => {
      if (stateInternal.lastId < data.id) {
        stateInternal.lastId = data.id;
      }
      stateInternal.data[data.id] = data;
    });
    state.data.forEach((stateData: any) => {
      const targetId = stateData['id'];
      stateData['###i-list###'] = jsonData.filter((data: any) => data['###i-target###'] === targetId) || [];
    });
    return {
      statusCode: 204,
    };
  }

  const stubs: StubCollection = {
    get: {
      stub: {
        predicates: [{ matches: { method: 'GET', path: configApi.api + '/\\d+$' } }],
        responses: [{ inject: fillData(injectGet.toString(), relation) }],
      },
    },
    list: {
      stub: {
        predicates: [
          {
            matches: {
              method: 'GET',
              path: configApi.config.internal.apiList.replace(/:[^\/#?]+/, '([^\\/#?]+)') + '([?#].+)?$',
            },
          },
        ],
        responses: [
          {
            inject: fillData(injectList.toString(), relation),
          },
        ],
      },
    },
    post: {
      stub: {
        predicates: [{ matches: { method: 'POST', path: configApi.api + '$' } }],
        responses: [{ inject: fillData(injectPost.toString(), relation) }],
      },
    },
    put: {
      stub: {
        predicates: [{ matches: { method: 'PUT', path: configApi.api + '/\\d+$' } }],
        responses: [{ inject: fillData(injectPut.toString(), relation) }],
      },
    },
    delete: {
      stub: {
        predicates: [{ matches: { method: 'DELETE', path: configApi.api + '/\\d+$' } }],
        responses: [{ inject: fillData(injectDelete.toString(), relation) }],
      },
    },
    patch: {
      stub: {
        predicates: [{ matches: { method: 'PATCH', path: configApi.api + '$' } }],
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

  return { ['(api)' + name]: stubsFiltered };
}
