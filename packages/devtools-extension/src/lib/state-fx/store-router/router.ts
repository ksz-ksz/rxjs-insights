import { History, Location } from './history';
import { RouteConfig } from './route-config';
import { matchRoutes, RouteMatch } from './match-routes';
import { Component, InitializedComponent } from '@lib/state-fx/store';
import { Encoder } from './encoder';

export interface Router<TData, TSearchInput, THashInput> {
  readonly history: History;
  readonly searchEncoder: Encoder<string, TSearchInput>;
  readonly hashEncoder: Encoder<string, THashInput>;
  createHref(location: Location): string;
  match(pathname: string): RouteMatch<TData, TSearchInput, THashInput>[];
  getRouteConfig(id: number): RouteConfig<TData, TSearchInput, THashInput>;
  init(routeConfig: RouteConfig<TData, TSearchInput, THashInput>): void;
}

export interface RouterComponent<TData, TSearchInput, THashInput>
  extends Component<Router<TData, TSearchInput, THashInput>> {}

export interface CreateRouterOptions<TData, TSearchInput, THashInput> {
  history: History;
  searchEncoder: Encoder<string, TSearchInput>;
  hashEncoder: Encoder<string, THashInput>;
}

export function createRouter<TData, TSearchInput, THashInput>({
  history,
  searchEncoder,
  hashEncoder,
}: CreateRouterOptions<TData, TSearchInput, THashInput>): RouterComponent<
  TData,
  TSearchInput,
  THashInput
> {
  return createRouterComponent(history, searchEncoder, hashEncoder);
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

function createRouterInstance<TData, TSearchInput, THashInput>(
  history: History,
  searchEncoder: Encoder<string, TSearchInput>,
  hashEncoder: Encoder<string, THashInput>
): Router<TData, TSearchInput, THashInput> {
  const routeConfigs = new Map<
    number,
    RouteConfig<TData, TSearchInput, THashInput>
  >();
  let rootRouteConfig:
    | RouteConfig<TData, TSearchInput, THashInput>
    | undefined = undefined;

  function createHref(location: Location): string {
    return history.format(location);
  }

  function match(
    pathname: string
  ): RouteMatch<TData, TSearchInput, THashInput>[] {
    if (rootRouteConfig === undefined) {
      throw new Error(`router not initialized`);
    }
    return matchRoutes(rootRouteConfig, pathname);
  }

  function getRouteConfig(
    routeId: number
  ): RouteConfig<TData, TSearchInput, THashInput> {
    if (rootRouteConfig === undefined) {
      throw new Error(`router not initialized`);
    }
    const routeConfig = routeConfigs.get(routeId);
    if (routeConfig === undefined) {
      throw new Error(`no route config with given id: ${routeId}`);
    }

    return routeConfig;
  }

  function init(routeConfig: RouteConfig<TData, TSearchInput, THashInput>) {
    if (rootRouteConfig !== undefined) {
      throw new Error(`router initialized`);
    }
    routeConfigVisitor(routeConfig, (target) =>
      routeConfigs.set(target.route.id, target)
    );
    rootRouteConfig = routeConfig;
  }

  return {
    history,
    searchEncoder,
    hashEncoder,
    createHref,
    match,
    getRouteConfig,
    init,
  };
}

function createRouterComponent<TData, TSearchInput, THashInput>(
  history: History,
  searchEncoder: Encoder<string, TSearchInput>,
  hashEncoder: Encoder<string, THashInput>
): RouterComponent<TData, TSearchInput, THashInput> {
  return {
    init(): InitializedComponent<Router<TData, TSearchInput, THashInput>> {
      const component = createRouterInstance<TData, TSearchInput, THashInput>(
        history,
        searchEncoder,
        hashEncoder
      );
      return { component };
    },
  };
}
