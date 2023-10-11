import {
  Action,
  Actions,
  ActionTypes,
  createEffectInstance,
  Effect,
  StateSelectorFunction,
  Store,
} from '../store';
import {
  NavigationRequested,
  RouteEvent,
  RouterActions,
} from './router-actions';
import { Router } from './router';
import { HistoryEntry, Location } from './history';
import { RouteObject } from './route-object';
import {
  concat,
  concatMap,
  filter,
  ignoreElements,
  map,
  Observable,
  of,
  tap,
} from 'rxjs';
import { RouteContext, RoutingRule } from './route-config';
import { RouterState } from './router-store';
import { diffRoutes } from './diff-routes';
import { fromHistory } from './routing';
import { ComponentsResolver } from './components-resolver';

function matchRoutes<TData>(router: Router<TData>, location: Location) {
  const matches = router.match(location.pathname);
  const routes: RouteObject<any, any, any>[] = [];
  let params = {};
  for (const match of matches) {
    params = { ...params, ...match.params };
    routes.push({
      id: match.routeConfig.id,
      path: match.path,
      params: params,
      search: match.routeConfig.route.search?.decode(location.search).value,
      hash: match.routeConfig.route.hash?.decode(location.hash).value,
    });
  }
  return routes;
}

function createRouteContext<TData>(
  route: RouteObject,
  router: Router<TData>
): RouteContext<TData> {
  return {
    route,
    routeConfig: router.getRouteConfig(route.id),
  };
}

function createResolveObservable<TNamespace extends string, TData>(
  routingRulesResolver: ComponentsResolver<RoutingRule<TData>>,
  router: Router<TData>,
  nextLocation: Location,
  prevLocation: Location | undefined,
  nextRoutes: RouteObject<any, any, any>[],
  prevRoutes: RouteObject<any, any, any>[],
  updatedRoutes: [RouteObject<any, any, any>, RouteObject<any, any, any>][],
  activatedRoutes: RouteObject<any, any, any>[],
  deactivatedRoutes: RouteObject<any, any, any>[]
) {
  const resolve: Observable<Location | boolean>[] = [];
  for (const deactivatedRoute of deactivatedRoutes) {
    const routing = router.getRouteConfig(deactivatedRoute.id);
    if (routing.rules !== undefined) {
      for (const rule of routing.rules) {
        const resolvedRule = routingRulesResolver.resolve(rule);
        if (resolvedRule.check !== undefined) {
          resolve.push(
            resolvedRule.check({
              status: 'deactivated',
              location: nextLocation,
              prevLocation: prevLocation,
              prevRoute: createRouteContext(deactivatedRoute, router),
              prevRoutes: createRuleRoutes(prevRoutes, router),
            })
          );
        }
      }
    }
  }
  for (const [prevUpdatedRoute, nextUpdateRoute] of updatedRoutes) {
    const routing = router.getRouteConfig(nextUpdateRoute.id);
    if (routing.rules !== undefined) {
      for (const rule of routing.rules) {
        const resolvedRule = routingRulesResolver.resolve(rule);
        if (resolvedRule.check !== undefined) {
          resolve.push(
            resolvedRule.check({
              status: 'updated',
              location: nextLocation,
              prevLocation: prevLocation,
              route: createRouteContext(nextUpdateRoute, router),
              routes: createRuleRoutes(nextRoutes, router),
              prevRoute: createRouteContext(prevUpdatedRoute, router),
              prevRoutes: createRuleRoutes(prevRoutes, router),
            })
          );
        }
      }
    }
  }
  for (const activatedRoute of activatedRoutes) {
    const routing = router.getRouteConfig(activatedRoute.id);
    if (routing.rules !== undefined) {
      for (const rule of routing.rules) {
        const resolvedRule = routingRulesResolver.resolve(rule);
        if (resolvedRule.check !== undefined) {
          resolve.push(
            resolvedRule.check({
              status: 'activated',
              location: nextLocation,
              prevLocation: prevLocation,
              route: createRouteContext(activatedRoute, router),
              routes: createRuleRoutes(nextRoutes, router),
            })
          );
        }
      }
    }
  }
  return concat(...resolve);
}

function createCommitObservable<TNamespace extends string, TData>(
  routingRulesResolver: ComponentsResolver<RoutingRule<TData>>,
  router: Router<TData>,
  nextLocation: Location,
  prevLocation: Location | undefined,
  nextRoutes: RouteObject<any, any, any>[],
  prevRoutes: RouteObject<any, any, any>[],
  updatedRoutes: [RouteObject<any, any, any>, RouteObject<any, any, any>][],
  activatedRoutes: RouteObject<any, any, any>[],
  deactivatedRoutes: RouteObject<any, any, any>[]
) {
  const commit: Observable<void>[] = [];
  for (const deactivatedRoute of deactivatedRoutes) {
    const routing = router.getRouteConfig(deactivatedRoute.id);
    if (routing.rules !== undefined) {
      for (const rule of routing.rules) {
        const resolvedRule = routingRulesResolver.resolve(rule);
        if (resolvedRule.commit !== undefined) {
          commit.push(
            resolvedRule.commit({
              status: 'deactivated',
              location: nextLocation,
              prevLocation: prevLocation,
              prevRoute: createRouteContext(deactivatedRoute, router),
              prevRoutes: createRuleRoutes(prevRoutes, router),
            })
          );
        }
      }
    }
  }
  for (const [prevUpdatedRoute, nextUpdateRoute] of updatedRoutes) {
    const routing = router.getRouteConfig(nextUpdateRoute.id);
    if (routing.rules !== undefined) {
      for (const rule of routing.rules) {
        const resolvedRule = routingRulesResolver.resolve(rule);
        if (resolvedRule.commit !== undefined) {
          commit.push(
            resolvedRule.commit({
              status: 'updated',
              location: nextLocation,
              prevLocation: prevLocation,
              route: createRouteContext(nextUpdateRoute, router),
              routes: createRuleRoutes(nextRoutes, router),
              prevRoute: createRouteContext(prevUpdatedRoute, router),
              prevRoutes: createRuleRoutes(prevRoutes, router),
            })
          );
        }
      }
    }
  }
  for (const activatedRoute of activatedRoutes) {
    const routing = router.getRouteConfig(activatedRoute.id);
    if (routing.rules !== undefined) {
      for (const rule of routing.rules) {
        const resolvedRule = routingRulesResolver.resolve(rule);
        if (resolvedRule.commit !== undefined) {
          commit.push(
            resolvedRule.commit({
              status: 'activated',
              location: nextLocation,
              prevLocation: prevLocation,
              route: createRouteContext(activatedRoute, router),
              routes: createRuleRoutes(nextRoutes, router),
            })
          );
        }
      }
    }
  }
  return concat(...commit);
}

function createEvents<TNamespace extends string, TData>(
  nextLocation: Location,
  prevLocation: Location | undefined,
  nextRoutes: RouteObject<any, any, any>[],
  prevRoutes: RouteObject<any, any, any>[],
  updatedRoutes: [RouteObject<any, any, any>, RouteObject<any, any, any>][],
  activatedRoutes: RouteObject<any, any, any>[],
  deactivatedRoutes: RouteObject<any, any, any>[]
) {
  const events: RouteEvent<any, any, any>[] = [];
  for (const deactivatedRoute of deactivatedRoutes) {
    events.push({
      status: 'deactivated',
      deactivatedLocation: prevLocation!,
      deactivatedRoute: deactivatedRoute,
      deactivatedRoutes: prevRoutes,
    });
  }
  for (const [prevUpdatedRoute, nextUpdateRoute] of updatedRoutes) {
    events.push({
      status: 'updated',
      activatedLocation: nextLocation,
      activatedRoute: prevUpdatedRoute,
      activatedRoutes: nextRoutes,
      deactivatedLocation: prevLocation,
      deactivatedRoute: nextUpdateRoute,
      deactivatedRoutes: prevRoutes,
    });
  }
  for (const activatedRoute of activatedRoutes) {
    events.push({
      status: 'activated',
      activatedLocation: nextLocation,
      activatedRoute: activatedRoute,
      activatedRoutes: nextRoutes,
    });
  }
  return events;
}

function createRuleRoutes<TData>(
  routes: RouteObject<TData>[],
  router: Router<TData>
): RouteContext<TData>[] {
  return routes.map((route) => createRouteContext(route, router));
}

function createNavigateObservable<TState, TData>(
  routingRulesResolver: ComponentsResolver<RoutingRule<TData>>,
  action: Action<NavigationRequested>,
  actions: Actions,
  router: Router<TData>,
  routerActions: ActionTypes<RouterActions>,
  getRouterState: StateSelectorFunction<
    Record<string, RouterState>,
    [],
    RouterState
  >,
  routerStore: Store<string, RouterState>
) {
  return new Observable<Action<any>>((subscriber) => {
    {
      const { payload } = action;
      const prevState = getRouterState(routerStore.getState());
      const prevLocation = prevState.location;
      const prevRoutes = prevState.routes ?? [];
      const nextLocation = payload.location;
      const nextRoutes = matchRoutes(router, nextLocation);
      const { updatedRoutes, activatedRoutes, deactivatedRoutes } = diffRoutes(
        prevRoutes,
        nextRoutes
      );
      subscriber.next(
        routerActions.NavigationStarted({
          origin: payload.origin,
          location: nextLocation,
          state: payload.state,
          key: payload.key,
          routes: nextRoutes,
        })
      );
      const resolve = createResolveObservable(
        routingRulesResolver,
        router,
        nextLocation,
        prevLocation,
        nextRoutes,
        prevRoutes,
        updatedRoutes,
        activatedRoutes,
        deactivatedRoutes
      );
      const commit = createCommitObservable(
        routingRulesResolver,
        router,
        nextLocation,
        prevLocation,
        nextRoutes,
        prevRoutes,
        updatedRoutes,
        activatedRoutes,
        deactivatedRoutes
      );
      const events = createEvents(
        nextLocation,
        prevLocation,
        nextRoutes,
        prevRoutes,
        updatedRoutes,
        activatedRoutes,
        deactivatedRoutes
      );

      let redirected = false;

      subscriber.add(
        actions.ofType(routerActions.NavigationRequested).subscribe({
          next() {
            if (!redirected) {
              subscriber.next(
                routerActions.NavigationCanceled({
                  reason: 'overridden',
                  origin: payload.origin,
                  location: nextLocation,
                  state: payload.state,
                  key: payload.key,
                  routes: nextRoutes,
                })
              );
              subscriber.complete();
            }
          },
          error(error) {
            subscriber.error(error);
          },
          complete() {
            subscriber.complete();
          },
        })
      );

      subscriber.add(
        resolve
          .pipe(filter((x) => (typeof x === 'boolean' ? !x : true)))
          .subscribe({
            next(value) {
              if (typeof value === 'boolean') {
                subscriber.next(
                  routerActions.NavigationCanceled({
                    reason: 'intercepted',
                    origin: payload.origin,
                    location: nextLocation,
                    state: payload.state,
                    key: payload.key,
                    routes: nextRoutes,
                  })
                );
                subscriber.complete();
              } else {
                redirected = true;
                subscriber.next(
                  routerActions.NavigationCanceled({
                    reason: 'redirected',
                    origin: payload.origin,
                    location: nextLocation,
                    state: payload.state,
                    key: payload.key,
                    routes: nextRoutes,
                  })
                );
                subscriber.next(
                  routerActions.NavigationRequested({
                    origin: payload.origin,
                    location: value,
                    state: null,
                    key: payload.key,
                  })
                );
                subscriber.complete();
              }
            },
            error(error) {
              subscriber.error(error);
            },
            complete() {
              subscriber.add(
                concat(
                  events.map(routerActions.RouteResolved),
                  commit.pipe(ignoreElements()),
                  events.map(routerActions.RouteCommitted),
                  of(
                    routerActions.NavigationCompleted({
                      origin: payload.origin,
                      location: nextLocation,
                      state: payload.state,
                      key: payload.key,
                      routes: nextRoutes,
                    })
                  )
                ).subscribe(subscriber)
              );
            },
          })
      );
    }
  });
}

interface RouterHistoryState {
  key: string;
  state: any;
}

function isRouterHistoryState(x: any): x is RouterHistoryState {
  return typeof x === 'object' && x !== null && 'key' in x && 'state' in x;
}

function getState(entry: HistoryEntry): RouterHistoryState {
  if (isRouterHistoryState(entry.state)) {
    return entry.state;
  } else {
    return {
      key: 'default',
      state: null,
    };
  }
}

export function createRouterEffect<TData>(
  actions: Actions,
  router: Router<TData>,
  routerActions: ActionTypes<RouterActions>,
  routerStore: Store<string, RouterState>,
  routingRulesResolver: ComponentsResolver<RoutingRule<TData>>
): Effect {
  // TODO: replace with getOwnState or sth
  function getRouterState(state: { [namespace: string]: RouterState }) {
    return state[routerStore.namespace];
  }

  return createEffectInstance('router', actions, [], {
    createNewNavigationRequest(actions) {
      return actions.ofType(routerActions.Navigate).pipe(
        map(({ payload }) =>
          routerActions.NavigationRequested({
            origin: payload.historyMode ?? 'push',
            location: payload.location,
            state: payload.state,
            key: crypto.randomUUID(),
          })
        )
      );
    },
    createPopNavigationRequest() {
      return fromHistory(router.history).pipe(
        map((entry) => {
          const { key, state } = getState(entry);
          return routerActions.NavigationRequested({
            origin: 'pop',
            location: entry.location,
            state,
            key,
          });
        })
      );
    },
    handleNavigationRequest(actions) {
      return actions
        .ofType(routerActions.NavigationRequested)
        .pipe(
          concatMap((action) =>
            createNavigateObservable(
              routingRulesResolver,
              action,
              actions,
              router,
              routerActions,
              getRouterState,
              routerStore
            )
          )
        );
    },
    syncHistoryAfterNavigationCompleted(actions) {
      return actions.ofType(routerActions.NavigationCompleted).pipe(
        tap(({ payload }) => {
          const historyState = { state: payload.state, key: payload.key };
          if (payload.origin !== 'pop') {
            router.history.newEntry(payload.location, historyState, {
              mode: payload.origin,
            });
          }
        }),
        ignoreElements()
      );
    },
    syncHistoryAfterNavigationCancelled(actions, deps) {
      return actions.ofType(routerActions.NavigationCanceled).pipe(
        tap(({ payload }) => {
          if (payload.origin === 'pop' && payload.reason === 'intercepted') {
            const state = getRouterState(deps.getState());
            const historyState = { state: state.state, key: state.key };
            router.history.newEntry(state.location, historyState, {
              mode: 'replace',
            });
          }
        }),
        ignoreElements()
      );
    },
  });
}
