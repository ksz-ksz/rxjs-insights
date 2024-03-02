import {
  ExtractHash,
  ExtractHashInput,
  ExtractParams,
  ExtractSearch,
  ExtractSearchInput,
  Route,
} from './route';
import { Observable } from 'rxjs';
import { Location } from './history';
import { RouteObject } from './route-object';
import {
  Action,
  Component,
  Components,
  createComponent,
} from '@lib/state-fx/store';
import { RouterState } from './router-store';
import { RouteCommand } from './route-command';
import { Router } from './router';

export interface RouteContext<
  TData,
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> {
  route: RouteObject<TParams, TSearch, THash>;
  routeConfig: RouteConfig<TData, TParams, TSearch, THash>;
}
// TODO: handle cancellation (context.abortNotifier vs separate callback)
export interface RoutingRule<
  TData,
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> {
  check?(
    context: RouteCommand<TParams, TSearch, THash>,
    router: Router<TData>
  ): Observable<Action>;

  prepare?(
    context: RouteCommand<TParams, TSearch, THash>,
    router: Router<TData>
  ): Observable<Action>;

  commit?(
    context: RouteCommand<TParams, TSearch, THash>,
    router: Router<TData>
  ): Observable<Action>;
}

export type RouteConfig<
  TData,
  TSearchInput,
  THashInput,
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> = {
  route: Route<TParams, TSearch, THash, TSearchInput, THashInput>;
  children?: RouteConfig<TData, TSearchInput, THashInput>[];
  data?: TData;
  rules?: RoutingRule<TData, TParams, TSearch, THash>[];
};

export interface RouteConfigDef<TRoute extends Route, TData = unknown> {
  route: TRoute;
  data?: TData;
  rules?: RoutingRule<
    TData,
    ExtractParams<TRoute>,
    ExtractSearch<TRoute>,
    ExtractHash<TRoute>
  >[];
  children?: RouteConfig<
    TData,
    ExtractSearchInput<TRoute>,
    ExtractHashInput<TRoute>
  >[];
}

export interface CreateRouteConfigOptions<
  TData,
  TSearchInput,
  THashInput,
  TParams,
  TSearch,
  THash
> {
  children?: RouteConfig<TData, TSearchInput, THashInput>[];
  data?: TData;
  rules?: RoutingRule<TData, TParams, TSearch, THash>[];
}

export function createRouteConfig<
  TData,
  TParams,
  TSearch,
  THash,
  TSearchInput,
  THashInput
>(
  route: Route<TParams, TSearch, THash, TSearchInput, THashInput>,
  options?: CreateRouteConfigOptions<
    TData,
    TSearchInput,
    THashInput,
    TParams,
    TSearch,
    THash
  >
): RouteConfig<TData, TSearchInput, THashInput, TParams, TSearch, THash> {
  return { route, ...options };
}

export function createRouteConfigComponent<TRoute extends Route, TData, TDeps>(
  createRouteConfigDef: (deps: TDeps) => RouteConfigDef<TRoute, TData>,
  deps: Components<TDeps> = {} as Components<TDeps>
): Component<RouteConfigDef<TRoute, TData>> {
  return createComponent(createRouteConfigDef, { deps });
}
