import { Route } from './route';
import { Observable } from 'rxjs';
import { Location } from './history';
import { RouteObject } from './route-object';
import {
  Component,
  Container,
  Deps,
  ComponentInstance,
  useDeps,
  Action,
} from '@lib/state-fx/store';
import { RouterState } from './router-store';

export interface RouteContext<
  TData,
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> {
  route: RouteObject<TParams, TSearch, THash>;
  routeConfig: RouteConfig<TData, TParams, TSearch, THash>;
}

export interface ActivatedRoutingRuleEvent<
  TData,
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> {
  type: 'activate';
  deactivatedLocation: Location;
  activatedLocation: Location;
  activatedRoute: RouteContext<TData, TParams, TSearch, THash>;
  activatedRoutes: RouteContext<TData>[];
  routerState: RouterState;
}

export interface DeactivatedRoutingRuleEvent<
  TData,
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> {
  type: 'deactivate';
  activatedLocation: Location;
  deactivatedLocation: Location;
  deactivatedRoute: RouteContext<TData, TParams, TSearch, THash>;
  deactivatedRoutes: RouteContext<TData>[];
  routerState: RouterState;
}

export interface UpdatedRoutingRuleEvent<
  TData,
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> {
  type: 'activate-update' | 'deactivate-update';
  activatedLocation: Location;
  activatedRoute: RouteContext<TData, TParams, TSearch, THash>;
  activatedRoutes: RouteContext<TData>[];
  deactivatedLocation: Location;
  deactivatedRoute: RouteContext<TData, TParams, TSearch, THash>;
  deactivatedRoutes: RouteContext<TData>[];
  routerState: RouterState;
}

export type RoutingRuleEvent<
  TData,
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> =
  | ActivatedRoutingRuleEvent<TData, TParams, TSearch, THash>
  | DeactivatedRoutingRuleEvent<TData, TParams, TSearch, THash>
  | UpdatedRoutingRuleEvent<TData, TParams, TSearch, THash>;

// TODO: handle cancellation (context.abortNotifier vs separate callback)
export interface RoutingRule<
  TData,
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> {
  dispatchOnCheck?(
    context: RoutingRuleEvent<TData, TParams, TSearch, THash>
  ): Observable<Action>;

  dispatchOnCommit?(
    context: RoutingRuleEvent<TData, TParams, TSearch, THash>
  ): Observable<Action>;

  resolve?(
    context: RoutingRuleEvent<TData, TParams, TSearch, THash>
  ): Observable<void>;
}

export interface RouteConfig<
  TData,
  TSearchInput,
  THashInput,
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> {
  route: Route<TParams, TSearch, THash, TSearchInput, THashInput>;
  children?: RouteConfig<TData, TSearchInput, THashInput>[];
  data?: TData;
  rules?: RoutingRule<TData, TParams, TSearch, THash>[];
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

export function createRouteConfigFactory<TData, TSearchInput, THashInput>(): <
  TParams,
  TSearch,
  THash
>(
  route: Route<TParams, TSearch, THash, TSearchInput, THashInput>,
  routing?: CreateRouteConfigOptions<
    TData,
    TSearchInput,
    THashInput,
    TParams,
    TSearch,
    THash
  >
) => RouteConfig<TData, TSearchInput, THashInput, TParams, TSearch, THash> {
  return createRouteConfig;
}

export function createRoutingRule<TData, TParams, TSearch, THash, TDeps>(
  create: (deps: TDeps) => RoutingRule<TData, TParams, TSearch, THash>,
  depsComponents?: Deps<TDeps>
): Component<RoutingRule<TData, TParams, TSearch, THash>> {
  return {
    init(
      container: Container
    ): ComponentInstance<RoutingRule<TData, TParams, TSearch, THash>> {
      const { deps, depsHandles } = useDeps(
        container,
        depsComponents ?? ({} as Deps<TDeps>)
      );

      const routingRule = create(deps);

      return {
        component: routingRule,
        dispose() {
          for (const depsHandle of depsHandles) {
            depsHandle.release();
          }
        },
      };
    },
  };
}
