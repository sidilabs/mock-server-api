export type ConfigInjection = {
  request: {
    requestFrom: string;
    method: HttpMethod;
    path: string;
    query: { [key: string]: string };
    headers: { [key: string]: string };
    body: string;
    ip: string;
  };
  response: {
    statusCode?: number;
    headers?: { [key: string]: Primitive };
    body?: Primitive | Json;
  };
  state: { [key: string]: any };
  logger: {
    debug: (val: any, ...args: any[]) => void;
    info: (val: any, ...args: any[]) => void;
    warn: (val: any, ...args: any[]) => void;
    error: (val: any, ...args: any[]) => void;
    scopePrefix: string;
    withScope: string;
    changeScope: string;
    baseLogger: string;
  };
};
export type InjectionFunction = (config: ConfigInjection) => void;

export type PathFunctionString = string;
export type InjectionFunctionOrString = string | InjectionFunction;
export type FunctionString = string;
export type RegExpString = string;
export type HttpMethod = "GET" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "DELETE" | "PATCH";

export type Primitive = string | number | boolean;
export type Json = { [key: string]: Primitive | Primitive[] | Json | Json[] };

export type PredicateDef = { method: HttpMethod; path?: string | RegExpString; query?: { [key: string]: string } };

export type Predicate = {
  equals?: PredicateDef;
  matches?: PredicateDef;
  or?: Predicate[];
  and?: Predicate[];
  inject?: FunctionString;
};

export type Behavior = {
  wait?: number | FunctionString;
  decorate?: FunctionString;
};

export type Response = {
  is?: {
    statusCode?: number;
    headers?: {
      [key: string]: string | number | boolean;
    };
    body?: Primitive | Json;
  };
  behaviors?: Behavior[];
  inject?: InjectionFunctionOrString;
  run?: PathFunctionString;
};

export type Stub = {
  predicates: Predicate[];
  responses: Response[];
};

export type StubData = {
  stub: Stub;
};

export type StubCollection = {
  [key: string]: StubData | Stub;
};

export type StubsModule = {
  [key: string]: StubCollection;
};

export type ApiMethods = "LIST" | "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type Params = {
  id?: string | number;
  params: { [key: string]: string | number | boolean };
  api: {
    url: string;
    db: any;
    state: any;
  };
};

export type CallbackMap = {
  LIST?: (config: ConfigInjection, paramValues: Params, jsonResult: any) => any;
  GET?: (config: ConfigInjection, paramValues: Params, jsonResult: any) => any;
  POST?: (config: ConfigInjection, paramValues: Params, jsonResult: any) => any;
  PUT?: (config: ConfigInjection, paramValues: Params) => any;
  DELETE?: (config: ConfigInjection, paramValues: Params) => any;
};

export type KeysCallbackMap = keyof CallbackMap;

export type ApiData<T> = {
  model?: string;
  state: string;
  api: RegExpString;
  dataApi?: string;
  data?: any[];
  dataPriority?: number;
  methods?: ApiMethods[];
  callbacks?: CallbackMap;
  config?: T;
};

export type ApiCollection = {
  [key: string]: ApiData<any>;
};

export type FnData = {
  run: string;
};

export type FnCollection = {
  [key: string]: FnData;
};

export type ApiStub = {
  baseUrl?: string;
  apis?: ApiCollection;
  stubs?: StubCollection;
};
