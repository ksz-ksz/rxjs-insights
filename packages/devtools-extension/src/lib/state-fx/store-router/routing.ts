import { Route } from './route';
import { Observable } from 'rxjs';
import { Location } from './history';
import { ActiveRoute } from './active-route';
import { Store } from '@lib/state-fx/store';

export interface ActiveRouting<TState, TConfig, TParams, TSearch, THash> {
  routing: Routing<TState, TConfig, TParams, TSearch, THash>;
  route: ActiveRoute<TParams, TSearch, THash>;
}

export interface ActivatedRoutingRuleContext<
  TState,
  TConfig,
  TParams,
  TSearch,
  THash
> {
  status: 'activated';
  route: ActiveRouting<TState, TConfig, TParams, TSearch, THash>;
  routes: ActiveRouting<TState, TConfig, any, any, any>[];
  store: Store<TState>;
  location: Location;
  prevLocation: Location | undefined;
}

export interface DeactivatedRoutingRuleContext<
  TState,
  TConfig,
  TParams,
  TSearch,
  THash
> {
  status: 'deactivated';
  prevRoute: ActiveRouting<TState, TConfig, TParams, TSearch, THash>;
  prevRoutes: ActiveRouting<TState, TConfig, any, any, any>[];
  store: Store<TState>;
  location: Location;
  prevLocation: Location | undefined;
}

export interface UpdatedRoutingRuleContext<
  TState,
  TConfig,
  TParams,
  TSearch,
  THash
> {
  status: 'updated';
  route: ActiveRouting<TState, TConfig, TParams, TSearch, THash>;
  routes: ActiveRouting<TState, TConfig, any, any, any>[];
  prevRoute: ActiveRouting<TState, TConfig, TParams, TSearch, THash>;
  prevRoutes: ActiveRouting<TState, TConfig, any, any, any>[];
  store: Store<TState>;
  location: Location;
  prevLocation: Location | undefined;
}

export type RoutingRuleContext<TState, TConfig, TParams, TSearch, THash> =
  | ActivatedRoutingRuleContext<TState, TConfig, TParams, TSearch, THash>
  | DeactivatedRoutingRuleContext<TState, TConfig, TParams, TSearch, THash>
  | UpdatedRoutingRuleContext<TState, TConfig, TParams, TSearch, THash>;

// TODO: handle cancellation (context.abortNotifier vs separate callback)
export interface RoutingRule<TState, TConfig, TParams, TSearch, THash> {
  // TODO: rename: check
  resolve?(
    context: RoutingRuleContext<TState, TConfig, TParams, TSearch, THash>
  ): Observable<Location | boolean>;

  commit?(
    context: RoutingRuleContext<TState, TConfig, TParams, TSearch, THash>
  ): Observable<void>;
}

export interface Routing<TState, TConfig, TParams, TSearch, THash> {
  id: number;
  route: Route<TParams, TSearch, THash>;
  children?: Routing<TState, TConfig, any, any, any>[];
  config?: TConfig;
  rules?: RoutingRule<TState, TConfig, TParams, TSearch, THash>[];
}

export const routings = new Map<number, Routing<any, any, any, any, any>>();

export interface CreateRoutingOptions<
  TState,
  TConfig,
  TParams,
  TSearch,
  THash
> {
  children?: Routing<TState, TConfig, any, any, any>[];
  config?: TConfig;
  rules?: RoutingRule<TState, TConfig, TParams, TSearch, THash>[];
}

export function createRouting<TState, TConfig, TParams, TSearch, THash>(
  route: Route<TParams, TSearch, THash>,
  options?: CreateRoutingOptions<TState, TConfig, TParams, TSearch, THash>
): Routing<TState, TConfig, TParams, TSearch, THash> {
  const id = routings.size;
  const routing: Routing<any, any, any, any, any> = { id, route, ...options };
  routings.set(id, routing);
  return routing;
}

export function createRoutingFactory<TState, TConfig>(): <
  TParams,
  TSearch,
  THash
>(
  route: Route<TParams, TSearch, THash>,
  routing?: CreateRoutingOptions<TState, TConfig, TParams, TSearch, THash>
) => Routing<TState, TConfig, TParams, TSearch, THash> {
  return createRouting;
}
