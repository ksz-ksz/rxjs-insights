import { Route } from './route';
import { RouteConfig, RouterConfig } from './router-config';
import {
  Action,
  ActionFactories,
  combineReactions,
  createActions,
  createReaction,
  createReducer,
  old_createSelector,
  filterActions,
  Selector,
  Slice,
  Store,
} from '@lib/store';
import { createUrl, Url } from './url';
import {
  concat,
  concatMap,
  EMPTY,
  first,
  ignoreElements,
  Observable,
  of,
} from 'rxjs';
import { RouteMatcher } from './route-matcher';
import { RouteToken } from './route-token';

export interface RouterState<DATA> {
  url: Url;
  routes: Route<DATA>[];
}

export interface Router<SLICE extends string, DATA, METADATA> {
  slice: SLICE;
  actions: ActionFactories<RouterActions<DATA>>;
  selectors: RouterSelectors<SLICE, DATA, METADATA>;
  match(path: string[]): Route<DATA>[];
  getRouteConfig(id: number): RouteConfig<DATA, METADATA> | undefined;
}

export interface RouterActions<DATA> {
  Navigate: { url: Url };
  RouteLeave: { route: Route<DATA> };
  RouteEnter: { route: Route<DATA> };
  InterceptLeaveRedirect: { url: Url };
  InterceptEnterRedirect: { url: Url };
  NavigationComplete: { url: Url; routes: Route<DATA>[] };
}

export interface RouterSelectors<SLICE extends string, DATA, METADATA> {
  routes: Selector<Slice<SLICE, RouterState<DATA>>, Route<DATA>[]>;
  url: Selector<Slice<SLICE, RouterState<DATA>>, Url>;
  route(
    routeToken: RouteToken
  ): Selector<Slice<SLICE, RouterState<DATA>>, Route<DATA> | undefined>;
}

export function createRouter<SLICE extends string, DATA, METADATA>(
  routerSlice: SLICE,
  routerConfig: RouterConfig<DATA, METADATA>
): Router<SLICE, DATA, METADATA> {
  const routeMatcher = new RouteMatcher<DATA, METADATA>(
    routerConfig.routes ?? []
  );

  const routerActions = createActions<RouterActions<DATA>>(routerSlice);

  const routerSelector = old_createSelector(
    (state: Slice<SLICE, RouterState<DATA>>) => state[routerSlice]
  );

  const routerSelectors: RouterSelectors<SLICE, DATA, METADATA> = {
    url: old_createSelector([routerSelector], ([router]) => router.url),
    routes: old_createSelector([routerSelector], ([router]) => router.routes),
    route(routeToken: RouteToken) {
      return old_createSelector([routerSelector], ([router]) =>
        router.routes.find(
          (route) =>
            routeMatcher.getRouteConfig(route.routeConfigId)?.token ===
            routeToken
        )
      );
    },
  } as RouterSelectors<SLICE, DATA, METADATA>;

  return {
    slice: routerSlice,
    actions: routerActions,
    selectors: routerSelectors,
    match(path: string[]) {
      return routeMatcher.match(path);
    },
    getRouteConfig(id: number) {
      return routeMatcher.getRouteConfig(id);
    },
  };
}

function arraysEqual<T>(a: T[], b: T[]) {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

function routesEqual<DATA>(a: Route<DATA>, b: Route<DATA>) {
  return a.routeConfigId === b.routeConfigId && arraysEqual(a.path, b.path);
}

function diffRoutes<DATA>(
  prevRoutes: Route<DATA>[],
  nextRoutes: Route<DATA>[]
) {
  const length = Math.max(prevRoutes.length, nextRoutes.length);

  for (let i = 0; i < length; i++) {
    const prevRoute = prevRoutes[i];
    const nextRoute = nextRoutes[i];
    if (
      !(
        prevRoute !== undefined &&
        nextRoute !== undefined &&
        routesEqual(prevRoute, nextRoute)
      )
    ) {
      return {
        leaveRoutes: prevRoutes.slice(i).reverse(),
        enterRoutes: nextRoutes.slice(i),
      };
    }
  }
  return {
    leaveRoutes: [],
    enterRoutes: [],
  };
}

function getUrl(url: Url, payload: { url: Url }): Url {
  return {
    path: payload.url.path,
    queryParams: { ...url.queryParams, ...payload.url.queryParams },
    fragment: payload.url.fragment ?? url.fragment,
  };
}

export function createRouterSlice<SLICE extends string, DATA, METADATA>(
  router: Router<SLICE, DATA, METADATA>
) {
  const routerReducer = createReducer(router.slice, {
    url: createUrl(),
    routes: [],
  } as RouterState<DATA>).add(
    router.actions.NavigationComplete,
    (state, action) => {
      state.url = action.payload.url;
      state.routes = action.payload.routes;
    }
  );

  const routerReaction = combineReactions()
    .add(
      createReaction(
        (action$, store) =>
          action$.pipe(
            filterActions([
              router.actions.Navigate,
              router.actions.InterceptLeaveRedirect,
              router.actions.InterceptEnterRedirect,
            ]),
            concatMap((action) => {
              const prevUrl = store.select(router.selectors.url).get();
              const prevRoutes = store.select(router.selectors.routes).get();
              const dispatchOnLeave: Action[] = [];
              const nextUrl = getUrl(prevUrl, action.payload);
              const nextRoutes = router.match(action.payload.url.path);
              const dispatchOnEnter: Action[] = [];
              const awaits: Observable<never>[] = [];
              const { leaveRoutes, enterRoutes } = diffRoutes(
                prevRoutes,
                nextRoutes
              );

              for (const route of leaveRoutes) {
                const routeConfig = router.getRouteConfig(route.routeConfigId);
                if (routeConfig?.interceptLeave) {
                  const result = routeConfig.interceptLeave(
                    store,
                    prevUrl,
                    route
                  );
                  if (typeof result === 'boolean') {
                    if (!result) {
                      return EMPTY;
                    }
                  } else {
                    return of(
                      router.actions.InterceptLeaveRedirect({ url: result })
                    );
                  }
                }
                dispatchOnLeave.push(router.actions.RouteLeave({ route }));
                if (routeConfig?.dispatchOnLeave) {
                  dispatchOnLeave.push(
                    routeConfig.dispatchOnLeave(store, prevUrl, route)
                  );
                }
              }

              for (const route of enterRoutes) {
                const routeConfig = router.getRouteConfig(route.routeConfigId);
                if (routeConfig?.interceptEnter) {
                  const result = routeConfig.interceptEnter(
                    store,
                    nextUrl,
                    route
                  );
                  if (typeof result === 'boolean') {
                    if (!result) {
                      return EMPTY;
                    }
                  } else {
                    return of(
                      router.actions.InterceptEnterRedirect({ url: result })
                    );
                  }
                }
                if (routeConfig?.dispatchOnEnter) {
                  dispatchOnEnter.push(
                    routeConfig.dispatchOnEnter(store, nextUrl, route)
                  );
                }
                if (routeConfig?.await) {
                  awaits.push(
                    routeConfig
                      .await(store, nextUrl, route)
                      .pipe(first(Boolean), ignoreElements())
                  );
                }
                dispatchOnEnter.push(router.actions.RouteEnter({ route }));
              }

              return concat(
                of(...dispatchOnLeave),
                of(...dispatchOnEnter),
                ...awaits,
                of(
                  router.actions.NavigationComplete({
                    url: nextUrl,
                    routes: nextRoutes,
                  })
                )
              );
            })
          ),
        (store: Store<Slice<SLICE, RouterState<DATA>>>) => store
      )
    )
    .add(
      createReaction(() => of(router.actions.Navigate({ url: createUrl() })))
    );

  return {
    routerReducer,
    routerReaction,
  };
}
