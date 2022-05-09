import { Route } from './route';
import { RouteConfig, Routing } from './routing';
import {
  combineReactions,
  createAction,
  createReaction,
  createReducer,
  createSelector,
  filterActions,
  on,
  Slice,
  Store,
} from '@lib/store';
import { createUrl, Url } from './url';
import { concatMap, EMPTY, of } from 'rxjs';
import { RouteMatcher } from './route-matcher';

export interface RouterState<DATA> {
  url: Url;
  routes: Route<DATA>[];
}

export function createRouter<SLICE extends string, DATA, METADATA>(
  routerSlice: SLICE,
  routing: Routing<DATA, METADATA>
) {
  type RouterSlice = Slice<SLICE, RouterState<DATA>>;

  const routeMatcher = new RouteMatcher<DATA, METADATA>(routing.routes ?? []);

  const routerActions = {
    Navigate: createAction<{ url: Url }>('Navigate', routerSlice),
    InterceptLeaveRedirect: createAction<{ url: Url }>(
      'InterceptLeaveRedirect',
      routerSlice
    ),
    InterceptEnterRedirect: createAction<{ url: Url }>(
      'InterceptEnterRedirect',
      routerSlice
    ),
    NavigationComplete: createAction<{ url: Url; routes: Route<DATA>[] }>(
      'NavigationComplete',
      routerSlice
    ),
  };

  const routerSelectors = {
    url: createSelector((state: RouterState<DATA>) => state.url, routerSlice),
    routes: createSelector(
      (state: RouterState<DATA>) => state.routes,
      routerSlice
    ),
  };

  const routerReducer = createReducer(
    routerSlice,
    { url: createUrl(), routes: [] } as RouterState<DATA>,
    [
      on(routerActions.NavigationComplete, (state, action) => {
        state.routes = action.payload.routes;
      }),
    ]
  );

  const routerReaction = combineReactions()
    .add(
      createReaction(
        (action$, store) =>
          action$.pipe(
            filterActions([
              routerActions.Navigate,
              routerActions.InterceptLeaveRedirect,
              routerActions.InterceptEnterRedirect,
            ]),
            concatMap((action) => {
              const prevUrl = store.get(routerSelectors.url);
              const prevRoutes = store.get(routerSelectors.routes);

              for (const route of prevRoutes) {
                const routeConfig = routeMatcher.getRouteConfig(route.id);
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
                      routerActions.InterceptLeaveRedirect({ url: result })
                    );
                  }
                }
              }

              const nextUrl = action.payload.url;
              const nextRoutes = routeMatcher.match(action.payload.url.path);

              for (const route of nextRoutes) {
                const routeConfig = routeMatcher.getRouteConfig(route.id);
                if (routeConfig?.interceptEnter) {
                  const result = routeConfig.interceptEnter(
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
                      routerActions.InterceptEnterRedirect({ url: result })
                    );
                  }
                }
              }

              return of(
                routerActions.NavigationComplete({
                  url: nextUrl,
                  routes: nextRoutes,
                })
              );
            })
          ),
        (store: Store<RouterSlice>) => store
      )
    )
    .add(
      createReaction(() => of(routerActions.Navigate({ url: createUrl() })))
    );

  const getRouteConfig = (id: number) => routeMatcher.getRouteConfig(id);

  return {
    routerActions,
    routerSelectors,
    routerReducer,
    routerReaction,
    getRouteConfig,
  };
}
