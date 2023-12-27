import { History, Location } from './history';
import { RouteConfig } from './route-config';
import { matchRoutes, RouteMatch } from './match-routes';
import {
  Component,
  ComponentInstance,
  Components,
  createComponent,
  Disposable,
  Store,
} from '@lib/state-fx/store';
import { Encoder } from './encoder';
import { createRouterActions, RouterActionTypes } from './router-actions';
import { createRouterStoreComponent, RouterState } from './router-store';
import { createResourceActions } from '../store-query/resource-actions';
import { createResourceStoreComponent } from '../store-query/resource-store';
import { ResourceConfig } from '../store-query/resource';
import {
  createRouterInitializer,
  createRouterInitializerComponent,
  RouterInitializerDef,
} from './router-initializer';

export interface Router<TData, TSearchInput = unknown, THashInput = unknown> {
  readonly history: History;
  readonly searchEncoder: Encoder<string, TSearchInput>;
  readonly hashEncoder: Encoder<string, THashInput>;
  createHref(location: Location): string;
  match(pathname: string): RouteMatch<TData, TSearchInput, THashInput>[];
  getRouteConfig(id: number): RouteConfig<TData, TSearchInput, THashInput>;
}

export interface RouterComponent<TData, TSearchInput, THashInput>
  extends Component<Router<TData, TSearchInput, THashInput>> {}

export interface RouterHarnessDef<TData, TSearchInput, THashInput> {
  name: string;
  history: History;
  searchEncoder: Encoder<string, TSearchInput>;
  hashEncoder: Encoder<string, THashInput>;
}

function createRouterConfigComponent<TData, TSearchInput, THashInput>() {
  return createComponent((): RouteConfig<TData, TSearchInput, THashInput> => {
    throw new Error('not provided');
  });
}

export function createRouterHarness<TData, TSearchInput, THashInput>({
  name,
  history,
  searchEncoder,
  hashEncoder,
}: RouterHarnessDef<TData, TSearchInput, THashInput>): {
  routerActions: RouterActionTypes;
  routerStoreComponent: Component<Store<RouterState>>;
  routerComponent: Component<Router<TData, TSearchInput, THashInput>>;
  routerConfigComponent: Component<
    RouteConfig<TData, TSearchInput, THashInput>
  >;
  routerInitializerComponent: Component<Disposable>;
} {
  const routerActions = createRouterActions(name);
  const routerStoreComponent = createRouterStoreComponent(name, routerActions);
  const routerConfigComponent = createRouterConfigComponent<
    TData,
    TSearchInput,
    THashInput
  >();
  const routerComponent = createRouterComponent(
    ({ routeConfig }): RouterDef<TData, TSearchInput, THashInput> => ({
      name,
      history,
      searchEncoder,
      hashEncoder,
      routeConfig,
    }),
    {
      routeConfig: routerConfigComponent,
    }
  );
  const routerInitializerComponent = createRouterInitializerComponent(
    routerComponent,
    routerStoreComponent,
    (): RouterInitializerDef<TData, TSearchInput, THashInput> => ({
      name,
      actions: routerActions,
    })
  );
  return {
    routerActions,
    routerComponent,
    routerConfigComponent,
    routerInitializerComponent,
    routerStoreComponent,
  };
}

function routeConfigVisitor<TData, TSearchInput, THashInput>(
  routeConfig: RouteConfig<TData, TSearchInput, THashInput>,
  apply: (target: RouteConfig<TData, TSearchInput, THashInput>) => void
) {
  apply(routeConfig);
  for (const child of routeConfig?.children ?? []) {
    routeConfigVisitor(child, apply);
  }
}

function getRouteConfigs<TData, TSearchInput, THashInput>(
  rootRouteConfig: RouteConfig<TData, TSearchInput, THashInput>
) {
  const routeConfigs = new Map<
    number,
    RouteConfig<TData, TSearchInput, THashInput>
  >();
  routeConfigVisitor(rootRouteConfig, (target) =>
    routeConfigs.set(target.route.id, target)
  );
  return routeConfigs;
}

function createRouter<TData, TSearchInput, THashInput>(
  routerDef: RouterDef<TData, TSearchInput, THashInput>
): Router<TData, TSearchInput, THashInput> {
  const { history, searchEncoder, hashEncoder, routeConfig } = routerDef;
  const routeConfigs = getRouteConfigs(routeConfig);

  function createHref(location: Location): string {
    return history.format(location);
  }

  function match(
    pathname: string
  ): RouteMatch<TData, TSearchInput, THashInput>[] {
    return matchRoutes(routeConfig, pathname);
  }

  function getRouteConfig(
    routeId: number
  ): RouteConfig<TData, TSearchInput, THashInput> {
    const routeConfig = routeConfigs.get(routeId);
    if (routeConfig === undefined) {
      throw new Error(`no route config with given id: ${routeId}`);
    }

    return routeConfig;
  }

  return {
    history,
    searchEncoder,
    hashEncoder,
    createHref,
    match,
    getRouteConfig,
  };
}

export interface RouterDef<TData, TSearchInput, THashInput> {
  name: string;
  history: History;
  searchEncoder: Encoder<string, TSearchInput>;
  hashEncoder: Encoder<string, THashInput>;
  routeConfig: RouteConfig<TData, TSearchInput, THashInput>;
}

function createRouterComponent<TData, TSearchInput, THashInput, TDeps>(
  createRouterDef: (deps: TDeps) => RouterDef<TData, TSearchInput, THashInput>,
  deps: Components<TDeps> = {} as Components<TDeps>
) {
  return createComponent((deps) => createRouter(createRouterDef(deps)), {
    deps,
  });
}
