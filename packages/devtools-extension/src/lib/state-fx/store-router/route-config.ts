import { Route } from './route';
import { Observable } from 'rxjs';
import { Location } from './history';
import { RouteObject } from './route-object';
import { Component, Store, StoreView } from '@lib/state-fx/store';

export interface RouteContext<
  TData,
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> {
  route: RouteObject<TParams, TSearch, THash>;
  routeConfig: RouteConfig<TData, TParams, TSearch, THash>;
}

export interface ActivatedRoutingRuleContext<
  TData,
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> {
  status: 'activated';
  route: RouteContext<TData, TParams, TSearch, THash>;
  routes: RouteContext<TData>[];
  location: Location;
  prevLocation: Location | undefined;
}

export interface DeactivatedRoutingRuleContext<
  TData,
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> {
  status: 'deactivated';
  prevRoute: RouteContext<TData, TParams, TSearch, THash>;
  prevRoutes: RouteContext<TData>[];
  location: Location;
  prevLocation: Location | undefined;
}

export interface UpdatedRoutingRuleContext<
  TData,
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> {
  status: 'updated';
  route: RouteContext<TData, TParams, TSearch, THash>;
  routes: RouteContext<TData>[];
  prevRoute: RouteContext<TData, TParams, TSearch, THash>;
  prevRoutes: RouteContext<TData>[];
  location: Location;
  prevLocation: Location | undefined;
}

export type RoutingRuleContext<
  TData,
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> =
  | ActivatedRoutingRuleContext<TData, TParams, TSearch, THash>
  | DeactivatedRoutingRuleContext<TData, TParams, TSearch, THash>
  | UpdatedRoutingRuleContext<TData, TParams, TSearch, THash>;

// TODO: handle cancellation (context.abortNotifier vs separate callback)
export interface RoutingRule<
  TData,
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> {
  check?(
    context: RoutingRuleContext<TData, TParams, TSearch, THash>
  ): Observable<Location | boolean>;

  commit?(
    context: RoutingRuleContext<TData, TParams, TSearch, THash>
  ): Observable<void>;
}

export interface RouteConfig<
  TData,
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> {
  id: number;
  route: Route<TParams, TSearch, THash>;
  children?: RouteConfig<TData>[];
  data?: TData;
  rules?: Component<RoutingRule<TData, TParams, TSearch, THash>>[];
}

export interface CreateRouteConfigOptions<TData, TParams, TSearch, THash> {
  children?: RouteConfig<TData>[];
  data?: TData;
  rules?: Component<RoutingRule<TData, TParams, TSearch, THash>>[];
}

let routeConfigId = 0;

export function createRouteConfig<TData, TParams, TSearch, THash>(
  route: Route<TParams, TSearch, THash>,
  options?: CreateRouteConfigOptions<TData, TParams, TSearch, THash>
): RouteConfig<TData, TParams, TSearch, THash> {
  return { id: routeConfigId++, route, ...options };
}

export function createRouteConfigFactory<TData>(): <TParams, TSearch, THash>(
  route: Route<TParams, TSearch, THash>,
  routing?: CreateRouteConfigOptions<TData, TParams, TSearch, THash>
) => RouteConfig<TData, TParams, TSearch, THash> {
  return createRouteConfig;
}
