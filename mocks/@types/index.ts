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
    debug: (val: string) => void;
    info: (val: string) => void;
    warn: (val: string) => void;
    error: (val: string) => void;
  };
};
export type FunctionString = string;
export type RegExpString = string;
export type HttpMethod = "GET" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "DELETE";

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
      [key: string]: string | number;
    };
    body?: Primitive | Json;
  };
  _behaviors?: Behavior;
  inject?: FunctionString;
};

export type Stub = {
  predicates: Predicate[];
  responses: Response[];
};

export type StubData = {
  stub: Stub;
};

export type StubCollection = {
  [key: string]: StubData;
};

export type StubsModule = {
  [key: string]: StubCollection;
};

export type ApiData = {
  state: string;
  path: string;
  iniData: any[];
};

export type ApiCollection = {
  [key: string]: ApiData;
};
