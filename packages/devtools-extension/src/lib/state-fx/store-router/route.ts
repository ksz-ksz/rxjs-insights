import { ParamType } from './param-type';
import { StringParam } from './string-param';
import { NumberParam } from './number-param';
import { BooleanParam } from './boolean-param';

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

type ExtractPathParams<TRoute extends Route<unknown, unknown>> =
  TRoute extends Route<infer TPathParams, unknown> ? TPathParams : never;

type ExtractQueryParams<TRoute extends Route<unknown, unknown>> =
  TRoute extends Route<unknown, infer TQueryParams> ? TQueryParams : never;

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

export interface Route<TPathParams, TQueryParams> {
  readonly path: string;
  readonly pathParams: MapParamTypes<TPathParams>;
  readonly queryParams: MapParamTypes<TQueryParams>;
}

export interface CreateLocationWithRequiredOptions<TPathParams, TQueryParams> {
  (
    options: CreateLocationOptionsWithRequiredPathParams<
      TPathParams,
      TQueryParams
    >
  ): Location;
}

export interface CreateLocationOptionsWithRequiredPathParams<
  TPathParams,
  TQueryParams
> {
  pathParams: TPathParams;
  queryParams?: TQueryParams;
  fragment?: string;
}

export interface CreateLocationOptionsWithOptionalPathParams<
  TPathParams,
  TQueryParams
> {
  pathParams?: TPathParams;
  queryParams?: TQueryParams;
  fragment?: string;
}

export interface CreateLocationWithOptionalOptions<TPathParams, TQueryParams> {
  (
    options?: CreateLocationOptionsWithOptionalPathParams<
      TPathParams,
      TQueryParams
    >
  ): Location;
}

export type CreateLocation<TPathParams, TQueryParams> =
  keyof TPathParams extends never
    ? CreateLocationWithOptionalOptions<TPathParams, TQueryParams>
    : CreateLocationWithRequiredOptions<TPathParams, TQueryParams>;

export interface CreateRouteParams<
  TPath extends string,
  TPathParams extends PathParams<TPath>,
  TQueryParams extends QueryParams,
  TParent extends Route<unknown, unknown>
> {
  parent?: TParent;
  path: TPath;
  pathParams?: TPathParams;
  queryParams?: TQueryParams;
}

export type CreateRouteReturn<TPathParams, TQueryParams> = Route<
  TPathParams,
  TQueryParams
> &
  CreateLocation<TPathParams, TQueryParams>;

export function createRoute<
  TPath extends string,
  TPathParams extends PathParams<TPath>,
  TQueryParams extends QueryParams,
  TParent extends Route<unknown, unknown>
>(
  params: CreateRouteParams<TPath, TPathParams, TQueryParams, TParent>
): CreateRouteReturn<
  ExtractPathParams<TParent> & MapPathParams<TPath, TPathParams>,
  ExtractQueryParams<TParent> & MapQueryParams<TQueryParams>
> {
  return undefined as any;
}
