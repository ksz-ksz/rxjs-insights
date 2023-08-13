import { Path } from 'history';
import { Encoder } from './encoder';
import { EncoderFactories } from './encoder-factories';
import { EncoderFactory } from './encoder-factory';

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

export interface RouteCache {
  readonly path: string;
  readonly paramNames: string[];
  readonly paramTypes: EncoderFactories<any>;
  readonly searchTypes: Encoder<any>[];
  readonly hashTypes: Encoder<any>[];
}

export interface Route<TParams, TSearch, THash> {
  readonly path: string;
  readonly paramTypes: EncoderFactories<TParams>;
  readonly searchType: Encoder<TSearch>;
  readonly hashType: Encoder<THash>;
  readonly parent?: Route<any, any, any>;
  cache?: RouteCache;
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

export function createRoute<
  TPath extends string,
  TParams extends Params<TPath>,
  TParent extends Route<unknown, unknown, unknown>,
  TSearch = ExtractSearch<TParent>,
  THash = ExtractHash<TParent>
>(
  options: CreateRouteOptions<TPath, TParams, TSearch, THash, TParent>
): CreateRouteReturn<ExtractParams<TParent> & TParams, TSearch, THash> {
  return undefined as any;
}
