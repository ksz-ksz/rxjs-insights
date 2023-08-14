import { Path } from 'history';
import { Encoder } from './encoder';
import { EncoderFactories } from './encoder-factories';
import { EncoderFactory } from './encoder-factory';
import { Encoders } from './encoders';

type PathSegments<TPath extends string> = TPath extends ''
  ? never
  : TPath extends `${infer THead}/${infer TTail}`
  ? (THead extends '' ? never : THead) | PathSegments<TTail>
  : TPath;

type ParamName<TPathSegment> = TPathSegment extends `:${infer TParamName}`
  ? TParamName
  : never;

type ParamNames<TPath extends string> = ParamName<PathSegments<TPath>>;

type Params<TPath extends string> = {
  [name in ParamNames<TPath>]: unknown;
};

type ExtractParams<TRoute> = TRoute extends Route<
  infer TParams,
  unknown,
  unknown
>
  ? TParams
  : never;

type ExtractSearch<TRoute> = TRoute extends Route<
  unknown,
  infer TSearch,
  unknown
>
  ? TSearch
  : never;

type ExtractHash<TRoute> = TRoute extends Route<unknown, unknown, infer THash>
  ? THash
  : never;

export interface Route<TParams, TSearch, THash> {
  readonly parent: Route<any, any, any> | undefined;
  readonly path: string;
  readonly params: Encoders<TParams> | undefined;
  readonly search: Encoder<TSearch> | undefined;
  readonly hash: Encoder<THash> | undefined;
}

export interface CreatePathWithRequiredOptions<TParams, TSearch, THash> {
  (options: CreatePathOptionsWithRequiredParams<TParams, TSearch, THash>): Path;
}

export interface CreatePathOptionsWithRequiredParams<TParams, TSearch, THash> {
  params: TParams;
  search?: TSearch;
  hash?: THash;
}

export interface CreatePathOptionsWithOptionalParams<TParams, TSearch, THash> {
  params?: TParams;
  search?: TSearch;
  hash?: THash;
}

export interface CreatePathWithOptionalOptions<TParams, TSearch, THash> {
  (
    options?: CreatePathOptionsWithOptionalParams<TParams, TSearch, THash>
  ): Path;
}

export type CreatePath<TParams, TSearch, THash> = keyof TParams extends never
  ? CreatePathWithOptionalOptions<TParams, TSearch, THash>
  : CreatePathWithRequiredOptions<TParams, TSearch, THash>;

export interface CreateRouteOptionsWithRequiredParams<
  TPath extends string,
  TParams extends Params<TPath>,
  TSearch,
  THash,
  TParent extends Route<unknown, unknown, unknown>
> {
  parent?: TParent;
  path: TPath;
  params: EncoderFactories<TParams>;
  search?: EncoderFactory<TSearch, ExtractSearch<TParent>>;
  hash?: EncoderFactory<THash, ExtractHash<TParent>>;
}

export interface CreateRouteOptionsWithOptionalParams<
  TPath extends string,
  TParams extends Params<TPath>,
  TSearch,
  THash,
  TParent extends Route<unknown, unknown, unknown>
> {
  parent?: TParent;
  path: TPath;
  params?: EncoderFactories<TParams>;
  search?: EncoderFactory<TSearch, ExtractSearch<TParent>>;
  hash?: EncoderFactory<THash, ExtractHash<TParent>>;
}

export type CreateRouteOptions<
  TPath extends string,
  TParams extends Params<TPath>,
  TSearch,
  THash,
  TParent extends Route<unknown, unknown, unknown>
> = {} extends TParams
  ? CreateRouteOptionsWithOptionalParams<
      TPath,
      TParams,
      TSearch,
      THash,
      TParent
    >
  : CreateRouteOptionsWithRequiredParams<
      TPath,
      TParams,
      TSearch,
      THash,
      TParent
    >;

export type CreateRouteReturn<TParams, TSearch, THash> = Route<
  TParams,
  TSearch,
  THash
> &
  CreatePath<TParams, TSearch, THash>;

function createEncoders<T>(
  factories: EncoderFactories<T> | undefined
): Encoders<T> | undefined {
  if (factories === undefined) {
    return undefined;
  }
  const encoders: Encoders<T> = {} as any;
  for (let key in factories) {
    const factory = factories[key];
    encoders[key] = factory();
  }
  return encoders;
}

function createEncoder(
  factory: EncoderFactory<any, any> | undefined,
  parentEncoder: Encoder<any> | undefined
): Encoder<any> | undefined {
  if (factory === undefined) {
    return parentEncoder;
  }
  return factory(parentEncoder);
}

function formatPathParams(
  path: string,
  paramsEncoders: Encoders<any> | undefined,
  paramsValues: Params<any> | undefined
) {
  return path
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        const paramName = segment.substring(1);
        const paramEncoder = paramsEncoders?.[paramName];
        const paramValue = paramsValues?.[paramName];
        if (paramEncoder === undefined) {
          throw new Error(`no param encoder for "${paramName}"`);
        }
        if (paramValue === undefined) {
          throw new Error(`no param value for "${paramName}"`);
        }
        const result = paramEncoder.encode(paramValue);
        if (!result.valid) {
          throw new Error('param value is invalid');
        }
        return result.value;
      } else {
        return segment;
      }
    })
    .join('/');
}

function formatPath(
  route: Route<any, any, any>,
  params: Params<any> | undefined
): string {
  const encodedPath = formatPathParams(route.path, route.params, params);
  if (route.parent !== undefined) {
    return normalizePath(`${formatPath(route.parent, params)}/${encodedPath}`);
  } else {
    return normalizePath(encodedPath);
  }
}

function formatParam<T>(
  prefix: string,
  encoder: Encoder<T> | undefined,
  value: T | undefined
): string {
  const result = value !== undefined ? encoder?.encode(value) : undefined;
  if (result !== undefined && result.valid) {
    return `${prefix}${result.value}`;
  } else {
    return '';
  }
}

export function createRoute<
  TPath extends string,
  TParams extends Params<TPath>,
  TParent extends Route<unknown, unknown, unknown>,
  TSearch = ExtractSearch<TParent>,
  THash = ExtractHash<TParent>
>(
  options: CreateRouteOptions<TPath, TParams, TSearch, THash, TParent>
): CreateRouteReturn<ExtractParams<TParent> & TParams, TSearch, THash> {
  const route: Route<TParams, TSearch, THash> = {
    parent: options.parent,
    path: normalizePath(options.path),
    params: createEncoders(options.params),
    search: createEncoder(options.search, options?.parent?.search),
    hash: createEncoder(options.hash, options?.parent?.hash),
  };
  function createPath(
    options?: CreatePathOptionsWithOptionalParams<TParams, TSearch, THash>
  ): Path {
    const pathname = formatPath(route, options?.params);
    const search = formatParam('?', route.search, options?.search);
    const hash = formatParam('#', route.hash, options?.hash);

    return { pathname, search, hash };
  }

  return Object.assign(createPath, route) as any;
}

//
// function routesCollector(
//   route: Route<any, any, any>,
//   routes: Route<any, any, any>[]
// ): Route<any, any, any>[] {
//   if (route.parent !== undefined) {
//     routesCollector(route.parent, routes);
//   }
//   routes.push(route);
//   return routes;
// }
//
// function collectRoutes(route: Route<any, any, any>): Route<any, any, any>[] {
//   return routesCollector(route, []);
// }
//
// function constructPath(routes: Route<any, any, any>[]) {
//   return normalizePath(routes.map((x) => x.path).join('/'));
// }
//
// function constructParamNames(path: string) {
//   const paramNames = path
//     .split('/')
//     .filter((x) => x.startsWith(':'))
//     .map((x) => x.substring(1));
//
//   for (let firstIndexOf = 0; firstIndexOf < paramNames.length; firstIndexOf++) {
//     let paramName = paramNames[firstIndexOf];
//     const lastIndexOf = paramNames.lastIndexOf(paramName);
//     if (firstIndexOf !== lastIndexOf) {
//       throw new Error(`duplicated param name: "${paramName}"`);
//     }
//   }
//
//   return paramNames;
// }
//
// function constructParamTypes(routes: Route<any, any, any>[]) {
//   const paramTypes: ParamTypes<any> = {};
//   for (let route of routes) {
//     for (let key in route.paramTypes) {
//       if (paramTypes[key] !== undefined) {
//         throw new Error(`overridden param type: "${key}"`);
//       }
//       paramTypes[key] = route.paramTypes[key];
//     }
//   }
//   return paramTypes;
// }
//
// function constructSearchParamTypes(routes: Route<any, any, any>[]) {
//   const paramTypes: ParamType<any>[] = [];
//   for (let route of routes) {
//     if (route.searchType !== undefined) {
//       paramTypes.push(route.searchType);
//     }
//   }
//   return paramTypes;
// }
//
// function constructHashParamTypes(routes: Route<any, any, any>[]) {
//   const paramTypes: ParamType<any>[] = [];
//   for (let route of routes) {
//     if (route.hashType !== undefined) {
//       paramTypes.push(route.hashType);
//     }
//   }
//   return paramTypes;
// }
//
// function formatPathname(cache: RouteCache, paramValues: any) {
//   const { path, paramNames, paramTypes } = cache;
//
//   let pathname = path;
//   for (let paramName of paramNames) {
//     if (!(paramName in paramTypes)) {
//       throw new Error(`no path param type for name "${paramName}"`);
//     }
//     if (!(paramName in paramValues)) {
//       throw new Error(`no path param value for name "${paramName}"`);
//     }
//
//     const paramType = paramTypes[paramName];
//     const paramValue = paramValues[paramName];
//     const result = paramType.format(paramValue);
//
//     if (!result.valid) {
//       throw new Error(`path param value is invalid for name "${paramName}"`);
//     }
//
//     pathname = pathname.replace(paramName, result.value);
//   }
//   return pathname;
// }
//
// function formatParam(
//   paramTypes: ParamType<any>[],
//   paramValue: unknown | undefined
// ) {}
//
// export function createRoute<
//   TPath extends string,
//   TParams extends Params<TPath>,
//   TSearch,
//   THash,
//   TParent extends Route<unknown, unknown, unknown>
// >(
//   params: CreateRouteParams<TPath, TParams, TSearch, THash, TParent>
// ): CreateRouteReturn<
//   Extend<ExtractParams<TParent>, TParams>,
//   Extend<ExtractSearch<TParent>, TSearch>,
//   Extend<ExtractHash<TParent>, THash>
// > {
//   const route: Route<any, any, any> = {
//     path: params.path,
//     paramsTypes: params.params,
//     searchType: params.search,
//     hashType: params.hash,
//   };
//   const createPath: CreatePath<TParams, TSearch, THash> = (
//     options: CreatePathOptionsWithOptionalParams<
//       TParams,
//       TSearch,
//       THash
//     > = {}
//   ): Path => {
//     if (route.cache === undefined) {
//       const routes = collectRoutes(route);
//       const path = constructPath(routes);
//       const paramNames = constructParamNames(path);
//       const paramTypes = constructParamTypes(routes);
//       const searchTypes = constructSearchParamTypes(routes);
//       const hashTypes = constructHashParamTypes(routes);
//       route.cache = {
//         path,
//         paramNames,
//         paramTypes,
//         searchTypes,
//         hashTypes,
//       };
//     }
//     const pathname = formatPathname(route.cache, options.params);
//     const search = formatParam(route.cache.searchTypes, options.search);
//     const hash = formatParam(route.cache.hashTypes, options.hash);
//
//     return {
//       pathname,
//       search,
//       hash,
//     };
//   };
// }
//
function normalizePath(path: string) {
  let normalizedPath = path.replaceAll(/\/+/g, '/');
  if (normalizedPath.startsWith('/')) {
    normalizedPath = normalizedPath.substring(1);
  }
  if (normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.substring(0, -1);
  }
  return normalizedPath;
}

// function mergePaths(parentPath: string, path: string) {
//   return normalizePath(`${normalizePath(parentPath)}/${normalizePath(path)}`);
// }
