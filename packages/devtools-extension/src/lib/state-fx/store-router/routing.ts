import { Route } from './route';
import { Observable } from 'rxjs';
import { Location, Path } from 'history';
import { ActiveRoute } from './active-route';
import { Store } from '@lib/state-fx/store';

export interface RoutingRuleContext<TState, TConfig, TParams, TSearch, THash> {
  route: ActiveRoute<TParams, TSearch, THash>;
  config: TConfig;
  store: Store<TState>;
  location: Location;
}

export interface RoutingRule<TState, TConfig, TParams, TSearch, THash> {
  interceptEnter?(
    context: RoutingRuleContext<TState, TConfig, TParams, TSearch, THash>
  ): Observable<Path | boolean>;

  commitEnter?(
    context: RoutingRuleContext<TState, TConfig, TParams, TSearch, THash>
  ): Observable<void>;

  interceptLeave?(
    context: RoutingRuleContext<TState, TConfig, TParams, TSearch, THash>
  ): Observable<Path | boolean>;

  commitLeave?(
    context: RoutingRuleContext<TState, TConfig, TParams, TSearch, THash>
  ): Observable<void>;

  interceptChildEnter?(
    context: RoutingRuleContext<TState, TConfig, unknown, unknown, unknown>
  ): Observable<Path | boolean>;

  commitChildEnter?(
    context: RoutingRuleContext<TState, TConfig, unknown, unknown, unknown>
  ): Observable<void>;

  interceptChildLeave?(
    context: RoutingRuleContext<TState, TConfig, unknown, unknown, unknown>
  ): Observable<Path | boolean>;

  commitChildLeave?(
    context: RoutingRuleContext<TState, TConfig, unknown, unknown, unknown>
  ): Observable<void>;
}

export interface Routing<TState, TConfig, TParams, TSearch, THash> {
  route: Route<TParams, TSearch, THash>;
  children?: Routing<TState, TConfig, any, any, any>[];
  config?: TConfig;
  rules?: RoutingRule<TState, TConfig, TParams, TSearch, THash>[];
}

export function createRouting<TState, TConfig, TParams, TSearch, THash>(
  routing: Routing<TState, TConfig, TParams, TSearch, THash>
): Routing<TState, TConfig, TParams, TSearch, THash> {
  return routing;
}

export function createRoutingFactory<TState, TConfig>(): <
  TParams,
  TSearch,
  THash
>(
  routing: Routing<TState, TConfig, TParams, TSearch, THash>
) => Routing<TState, TConfig, TParams, TSearch, THash> {
  return createRouting;
}
