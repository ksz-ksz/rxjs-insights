import { Path } from 'history';
import { Encoder } from './encoder';
import { EncoderFactory } from './encoder-factory';
import { PathMatchers } from './path-matchers';

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
  readonly id: number;
  readonly parent: Route<any, any, any> | undefined;
  readonly path: string;
  readonly params: PathMatchers<TParams> | undefined;
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
  params: PathMatchers<TParams>;
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
  params?: PathMatchers<TParams>;
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

let ROUTE_ID = 0;

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
    id: ROUTE_ID++,
    parent: options.parent,
    path: normalizePath(options.path),
    params: options.params,
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
