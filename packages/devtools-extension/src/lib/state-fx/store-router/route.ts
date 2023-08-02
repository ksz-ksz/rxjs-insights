import { Location } from 'history';
import { ParamType } from './param-type';
import { z, ZodType } from 'zod';

type PathSegments<TPath extends string> = TPath extends ''
  ? never
  : TPath extends `${infer THead}/${infer TTail}`
  ? (THead extends '' ? never : THead) | PathSegments<TTail>
  : TPath;

type PathParamName<TPathSegment> =
  TPathSegment extends `:${infer TPathParamName}` ? TPathParamName : never;

type PathParamNames<TPath extends string> = PathParamName<PathSegments<TPath>>;

type PathParams<TPath extends string> = {
  [name in PathParamNames<TPath>]?: ParamType<unknown>;
};

type QueryParams = {
  [name: string]: ParamType<unknown>;
};

type ExtractPathParams<TRoute extends Route<unknown, unknown, unknown>> =
  TRoute extends Route<infer TPathParams, unknown, unknown>
    ? TPathParams
    : never;

type ExtractSearch<TRoute extends Route<unknown, unknown, unknown>> =
  TRoute extends Route<unknown, infer TSearch, unknown> ? TSearch : never;

type ExtractHash<TRoute extends Route<unknown, unknown, unknown>> =
  TRoute extends Route<unknown, unknown, infer THash> ? THash : never;

type ExtractParamType<TPathParam extends ParamType<unknown>> =
  TPathParam extends ParamType<infer T> ? T : never;

type MapPathParams<
  TPath extends string,
  TPathParams extends PathParams<TPath>
> = {
  [TPathParamName in PathParamNames<TPath>]: TPathParams[TPathParamName] extends object
    ? ExtractParamType<TPathParams[TPathParamName]>
    : string;
};

type MapQueryParams<TQueryParams extends QueryParams> = {
  [TQueryParamName in keyof TQueryParams]: ExtractParamType<
    TQueryParams[TQueryParamName]
  >;
};

type MapParamTypes<TParams> = {
  [TKey in keyof TParams]: ParamType<TParams[TKey]>;
};

export interface Route<TPathParams, TSearch, THash> {
  readonly path: string;
  readonly params: MapParamTypes<TPathParams>;
  readonly search: ParamType<TSearch>;
  readonly hash: ParamType<THash>;
}

export interface CreateLocationWithRequiredOptions<
  TPathParams,
  TSearch,
  THash
> {
  (
    options: CreateLocationOptionsWithRequiredPathParams<
      TPathParams,
      TSearch,
      THash
    >
  ): Location;
}

export interface CreateLocationOptionsWithRequiredPathParams<
  TPathParams,
  TSearch,
  THash
> {
  params: TPathParams;
  search?: TSearch;
  hash?: THash;
}

export interface CreateLocationOptionsWithOptionalPathParams<
  TPathParams,
  TSearch,
  THash
> {
  params?: TPathParams;
  search?: TSearch;
  hash?: THash;
}

export interface CreateLocationWithOptionalOptions<
  TPathParams,
  TSearch,
  THash
> {
  (
    options?: CreateLocationOptionsWithOptionalPathParams<
      TPathParams,
      TSearch,
      THash
    >
  ): Location;
}

export type CreateLocation<TPathParams, TSearch, THash> =
  keyof TPathParams extends never
    ? CreateLocationWithOptionalOptions<TPathParams, TSearch, THash>
    : CreateLocationWithRequiredOptions<TPathParams, TSearch, THash>;

export interface CreateRouteParams<
  TPath extends string,
  TPathParams extends PathParams<TPath>,
  TSearch extends ParamType<unknown>,
  THash extends ParamType<unknown>,
  TParent extends Route<unknown, unknown, unknown>
> {
  parent?: TParent;
  path: TPath;
  params?: TPathParams;
  search?: TSearch;
  hash?: THash;
}

export type CreateRouteReturn<TPathParams, TSearch, THash> = Route<
  TPathParams,
  TSearch,
  THash
> &
  CreateLocation<TPathParams, TSearch, THash>;

export function createRoute<
  TPath extends string,
  TPathParams extends PathParams<TPath>,
  TSearch extends ParamType<unknown>,
  THash extends ParamType<unknown>,
  TParent extends Route<unknown, unknown, unknown>
>(
  params: CreateRouteParams<TPath, TPathParams, TSearch, THash, TParent>
): CreateRouteReturn<
  ExtractPathParams<TParent> & MapPathParams<TPath, TPathParams>,
  ExtractSearch<TParent> & ExtractParamType<TSearch>,
  ExtractHash<TParent> & ExtractParamType<THash>
> {
  return undefined as any;
}

function Param<T>(type: ZodType<T>): ParamType<T> {
  return undefined as any;
}

function EncodedParams<T>(params: MapParamTypes<T>): ParamType<T> {
  return undefined as any;
}

const r = createRoute({
  path: 'targets/:targetId',
  params: {
    targetId: Param(z.coerce.number()),
  },
  search: EncodedParams({
    time: Param(z.coerce.number()),
  }),
  // hash: EncodedParams({}),
});

r({ params: { targetId: 42 }, search: { time: 123 } });
