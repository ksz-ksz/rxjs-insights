import { composeEncoders, Encoder } from './encoder';
import { EncoderFactory } from './encoder-factory';
import { PathMatchers } from './path-matchers';
import { Location } from './history';

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

export interface Route<
  TParams = unknown,
  TSearch = any,
  THash = any,
  TSearchInput = any,
  THashInput = any
> {
  readonly id: number;
  readonly parent: Route<any, any, any> | undefined;
  readonly path: string;
  readonly params: PathMatchers<TParams> | undefined;
  readonly search: Encoder<TSearchInput, TSearch> | undefined;
  readonly hash: Encoder<THashInput, THash> | undefined;
}

export interface CreateLocationWithRequiredOptions<TParams, TSearch, THash> {
  (
    options: CreateLocationOptionsWithRequiredParams<TParams, TSearch, THash>
  ): Location;
}

export interface CreateLocationOptionsWithRequiredParams<
  TParams,
  TSearch,
  THash
> {
  params: TParams;
  search?: TSearch;
  hash?: THash;
}

export interface CreateLocationOptionsWithOptionalParams<
  TParams,
  TSearch,
  THash
> {
  params?: TParams;
  search?: TSearch;
  hash?: THash;
}

export interface CreateLocationWithOptionalOptions<TParams, TSearch, THash> {
  (
    options?: CreateLocationOptionsWithOptionalParams<TParams, TSearch, THash>
  ): Location;
}

export type CreateLocation<TParams, TSearch, THash> =
  keyof TParams extends never
    ? CreateLocationWithOptionalOptions<TParams, TSearch, THash>
    : CreateLocationWithRequiredOptions<TParams, TSearch, THash>;

export interface CreateRouteOptionsWithRequiredParams<
  TPath extends string,
  TParams extends Params<TPath>,
  TSearch,
  THash,
  TParent extends Route<unknown, unknown, unknown>,
  TSearchInput,
  THashInput
> {
  parent?: TParent;
  path: TPath;
  params: PathMatchers<TParams>;
  search?: EncoderFactory<TSearchInput, TSearch, ExtractSearch<TParent>>;
  hash?: EncoderFactory<THashInput, THash, ExtractHash<TParent>>;
}

export interface CreateRouteOptionsWithOptionalParams<
  TPath extends string,
  TParams extends Params<TPath>,
  TSearch,
  THash,
  TParent extends Route<unknown, unknown, unknown>,
  TSearchInput,
  THashInput
> {
  parent?: TParent;
  path: TPath;
  params?: PathMatchers<TParams>;
  search?: EncoderFactory<TSearchInput, TSearch, ExtractSearch<TParent>>;
  hash?: EncoderFactory<THashInput, THash, ExtractHash<TParent>>;
}

export type CreateRouteOptions<
  TPath extends string,
  TParams extends Params<TPath>,
  TSearch,
  THash,
  TParent extends Route<unknown, unknown, unknown>,
  TSearchInput,
  THashInput
> = {} extends TParams
  ? CreateRouteOptionsWithOptionalParams<
      TPath,
      TParams,
      TSearch,
      THash,
      TParent,
      TSearchInput,
      THashInput
    >
  : CreateRouteOptionsWithRequiredParams<
      TPath,
      TParams,
      TSearch,
      THash,
      TParent,
      TSearchInput,
      THashInput
    >;

export type CreateRouteReturn<TParams, TSearch, THash> = Route<
  TParams,
  TSearch,
  THash
> &
  CreateLocation<TParams, TSearch, THash>;

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

function createEncoder(
  factory: EncoderFactory<any, any, any> | undefined,
  parentEncoder: Encoder<any, any> | undefined
): Encoder<any, any> | undefined {
  if (factory === undefined) {
    return parentEncoder;
  }
  return factory(parentEncoder);
}

function formatPathParams(
  path: string,
  paramsMatchers: PathMatchers<any> | undefined,
  paramsValues: Params<any> | undefined
) {
  return path
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        const paramName = segment.substring(1);
        const paramMatcher = paramsMatchers?.[paramName];
        const paramValue = paramsValues?.[paramName];
        if (paramMatcher === undefined) {
          throw new Error(`no param matcher for "${paramName}"`);
        }
        if (paramValue === undefined) {
          throw new Error(`no param value for "${paramName}"`);
        }
        const result = paramMatcher.format(paramValue);
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

function formatParam<TInput, T>(
  prefix: string,
  encoder: Encoder<TInput, T> | undefined,
  value: T | undefined
): string {
  const result = value !== undefined ? encoder?.encode(value) : undefined;
  if (result !== undefined && result.valid) {
    return `${prefix}${result.value}`;
  } else {
    return '';
  }
}

let ROUTE_ID = 0;

export interface CreateRouteFactoryOptions<TSearchInput, THashInput> {
  searchEncoder: Encoder<string, TSearchInput>;
  hashEncoder: Encoder<string, THashInput>;
}

export function createRouteFactory<TSearchInput, THashInput>(
  options: CreateRouteFactoryOptions<TSearchInput, THashInput>
): <
  TPath extends string,
  TParams extends Params<TPath>,
  TParent extends Route,
  TSearch = ExtractSearch<TParent>,
  THash = ExtractHash<TParent>
>(
  options: CreateRouteOptions<
    TPath,
    TParams,
    TSearch,
    THash,
    TParent,
    TSearchInput,
    THashInput
  >
) => CreateRouteReturn<ExtractParams<TParent> & TParams, TSearch, THash> {
  const { searchEncoder: searchInputEncoder, hashEncoder: hashInputEncoder } =
    options;
  return function createRoute<
    TSearchInput,
    THashInput,
    TPath extends string,
    TParams extends Params<TPath>,
    TParent extends Route,
    TSearch = ExtractSearch<TParent>,
    THash = ExtractHash<TParent>
  >(
    options: CreateRouteOptions<
      TPath,
      TParams,
      TSearch,
      THash,
      TParent,
      TSearchInput,
      THashInput
    >
  ): CreateRouteReturn<ExtractParams<TParent> & TParams, TSearch, THash> {
    const route: Route<TParams, TSearch, THash> = {
      id: ROUTE_ID++,
      parent: options.parent,
      path: normalizePath(options.path),
      params: options.params,
      search: createEncoder(options.search, options?.parent?.search),
      hash: createEncoder(options.hash, options?.parent?.hash),
    };

    const searchEncoder = route.search
      ? composeEncoders(searchInputEncoder, route.search)
      : undefined;
    const hashEncoder = route.hash
      ? composeEncoders(hashInputEncoder, route.hash)
      : undefined;
    function createPath(
      options?: CreateLocationOptionsWithOptionalParams<TParams, TSearch, THash>
    ): Location {
      const pathname = formatPath(route, options?.params);
      const search = formatParam('?', searchEncoder, options?.search);
      const hash = formatParam('#', hashEncoder, options?.hash);

      return { pathname, search, hash };
    }

    return Object.assign(createPath, route) as any;
  };
}
