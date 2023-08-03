import { Location } from 'history';
import { ParamType } from './param-type';
import { z } from 'zod';
import { Param } from './param';
import { URLEncodedParams } from './url-encoded-params';
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
  CreateLocation<TPathParams, TSearch, THash>;

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
> {
  return undefined as any;
}
