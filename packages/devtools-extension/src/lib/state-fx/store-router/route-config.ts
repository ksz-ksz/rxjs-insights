import { Route } from './route';
import { Observable } from 'rxjs';
import { Location } from './history';
import { RouteObject } from './route-object';
import {
  Component,
  Container,
  Deps,
  InitializedComponent,
  useDeps,
} from '@lib/state-fx/store';

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
  TSearchInput,
  THashInput,
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> {
  id: number;
  route: Route<TParams, TSearch, THash, TSearchInput, THashInput>;
  children?: RouteConfig<TData, TSearchInput, THashInput>[];
  data?: TData;
  rules?: Component<RoutingRule<TData, TParams, TSearch, THash>>[];
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
  rules?: Component<RoutingRule<TData, TParams, TSearch, THash>>[];
}

let routeConfigId = 0;

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
  return { id: routeConfigId++, route, ...options };
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
    ): InitializedComponent<RoutingRule<TData, TParams, TSearch, THash>> {
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
