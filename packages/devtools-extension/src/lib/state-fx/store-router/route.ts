import { Path } from 'history';
import { ParamType } from './param-type';
import { ParamTypes } from './param-types';

type PathSegments<TPath extends string> = TPath extends ''
  ? never
  : TPath extends `${infer THead}/${infer TTail}`
  ? (THead extends '' ? never : THead) | PathSegments<TTail>
  : TPath;

type PathParamName<TPathSegment> =
  TPathSegment extends `:${infer TPathParamName}` ? TPathParamName : never;

type PathParamNames<TPath extends string> = PathParamName<PathSegments<TPath>>;

type PathParams<TPath extends string> = {
  [name in PathParamNames<TPath>]: unknown;
};

type ExtractPathParams<TRoute extends Route<unknown, unknown, unknown>> =
  TRoute extends Route<infer TPathParams, unknown, unknown>
    ? TPathParams
    : never;

type ExtractSearch<TRoute extends Route<unknown, unknown, unknown>> =
  TRoute extends Route<unknown, infer TSearch, unknown> ? TSearch : never;

type ExtractHash<TRoute extends Route<unknown, unknown, unknown>> =
  TRoute extends Route<unknown, unknown, infer THash> ? THash : never;

export interface Route<TPathParams, TSearch, THash> {
  readonly path: string;
  readonly params: ParamTypes<TPathParams>;
  readonly search: ParamType<TSearch>;
  readonly hash: ParamType<THash>;
}

export interface CreatePathWithRequiredOptions<TPathParams, TSearch, THash> {
  (
    options: CreatePathOptionsWithRequiredPathParams<
      TPathParams,
      TSearch,
      THash
    >
  ): Path;
}

export interface CreatePathOptionsWithRequiredPathParams<
  TPathParams,
  TSearch,
  THash
> {
  params: TPathParams;
  search?: TSearch;
  hash?: THash;
}

export interface CreatePathOptionsWithOptionalPathParams<
  TPathParams,
  TSearch,
  THash
> {
  params?: TPathParams;
  search?: TSearch;
  hash?: THash;
}

export interface CreatePathWithOptionalOptions<TPathParams, TSearch, THash> {
  (
    options?: CreatePathOptionsWithOptionalPathParams<
      TPathParams,
      TSearch,
      THash
    >
  ): Path;
}

export type CreatePath<TPathParams, TSearch, THash> =
  keyof TPathParams extends never
    ? CreatePathWithOptionalOptions<TPathParams, TSearch, THash>
    : CreatePathWithRequiredOptions<TPathParams, TSearch, THash>;

export interface CreateRouteParams<
  TPath extends string,
  TPathParams extends PathParams<TPath>,
  TSearch,
  THash,
  TParent extends Route<unknown, unknown, unknown>
> {
  parent?: TParent;
  path: TPath;
  params?: ParamTypes<TPathParams>;
  search?: ParamType<TSearch>;
  hash?: ParamType<THash>;
}

export type CreateRouteReturn<TPathParams, TSearch, THash> = Route<
  TPathParams,
  TSearch,
  THash
> &
  CreatePath<TPathParams, TSearch, THash>;

export function createRoute<
  TPath extends string,
  TPathParams extends PathParams<TPath>,
  TSearch,
  THash,
  TParent extends Route<unknown, unknown, unknown>
>(
  params: CreateRouteParams<TPath, TPathParams, TSearch, THash, TParent>
): CreateRouteReturn<
  ExtractPathParams<TParent> & TPathParams,
  ExtractSearch<TParent> & TSearch,
  ExtractHash<TParent> & THash
> {}
