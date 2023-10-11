import { History, Location } from './history';
import { RouteConfig } from './route-config';
import { matchRoutes, RouteMatch } from './match-routes';
import { Component, InitializedComponent } from '@lib/state-fx/store';

export interface Router<TData> {
  readonly history: History;
  createHref(location: Location): string;
  match(pathname: string): RouteMatch<TData>[];
  getRouteConfig(id: number): RouteConfig<TData>;
  init(routeConfig: RouteConfig<TData>): void;
}

export interface RouterComponent<TData> extends Component<Router<TData>> {}

export interface CreateRouterOptions<TData> {
  history: History;
}

export function createRouter<TData>({
  history,
}: CreateRouterOptions<TData>): RouterComponent<TData> {
  return createRouterComponent(history);
}

function routeConfigVisitor<TData>(
  routeConfig: RouteConfig<TData>,
  apply: (target: RouteConfig<TData>) => void
) {
  apply(routeConfig);
  for (const child of routeConfig?.children ?? []) {
    routeConfigVisitor(child, apply);
  }
}

function createRouterInstance<TData>(history: History): Router<TData> {
  const routeConfigs = new Map<number, RouteConfig<TData>>();
  let rootRouteConfig: RouteConfig<TData> | undefined = undefined;

  function createHref(location: Location): string {
    return history.format(location);
  }

  function match(pathname: string): RouteMatch<TData>[] {
    if (rootRouteConfig === undefined) {
      throw new Error(`router not initialized`);
    }
    return matchRoutes(rootRouteConfig, pathname);
  }

  function getRouteConfig(routeId: number): RouteConfig<TData> {
    if (rootRouteConfig === undefined) {
      throw new Error(`router not initialized`);
    }
    const routeConfig = routeConfigs.get(routeId);
    if (routeConfig === undefined) {
      throw new Error(`no route config with given id: ${routeId}`);
    }

    return routeConfig;
  }

  function init(routeConfig: RouteConfig<TData>) {
    if (rootRouteConfig !== undefined) {
      throw new Error(`router initialized`);
    }
    routeConfigVisitor(routeConfig, (target) =>
      routeConfigs.set(target.id, target)
    );
    rootRouteConfig = routeConfig;
  }

  return {
    history,
    createHref,
    match,
    getRouteConfig,
    init,
  };
}

function createRouterComponent<TData>(
  history: History
): RouterComponent<TData> {
  return {
    init(): InitializedComponent<Router<TData>> {
      const component = createRouterInstance<TData>(history);
      return { component };
    },
  };
}
