import {
  Action,
  createEffect,
  createSelectorFunction,
  StateSelectorFunction,
  Store,
  typeOf,
} from '../store';
import { NavigationRequested, RouteEvent } from './router-actions';
import { Router } from './router';
import { HistoryEntry, Location } from './history';
import { ActiveRoute } from './active-route';
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
import { ActiveRouting } from './routing';
import { RouterState } from './router-reducer';
import { diffRoutes } from './diff-routes';
import { fromHistory } from './start-router';

function matchRoutes<TConfig>(
  router: Router<any, TConfig>,
  location: Location
) {
  const matches = router.match(location.pathname);
  const routes: ActiveRoute<any, any, any>[] = [];
  let params = {};
  for (const match of matches) {
    params = { ...params, ...match.params };
    routes.push({
      id: match.routing.id,
      path: match.path,
      params: params,
      search: match.routing.route.search?.decode(location.search).value,
      hash: match.routing.route.hash?.decode(location.hash).value,
    });
  }
  return routes;
}

function createRuleRoute(
  route: ActiveRoute<any, any, any>,
  router: Router<any, any>
): ActiveRouting<any, any, any, any, any> {
  return {
    route,
    routing: router.getRouting(route.id),
  };
}

function createResolveObservable<TNamespace extends string, TConfig>(
  store: Store<any>,
  router: Router<TNamespace, TConfig>,
  nextLocation: Location,
  prevLocation: Location | undefined,
  nextRoutes: ActiveRoute<any, any, any>[],
  prevRoutes: ActiveRoute<any, any, any>[],
  updatedRoutes: [ActiveRoute<any, any, any>, ActiveRoute<any, any, any>][],
  activatedRoutes: ActiveRoute<any, any, any>[],
  deactivatedRoutes: ActiveRoute<any, any, any>[]
) {
  const resolve: Observable<Location | boolean>[] = [];
  for (const deactivatedRoute of deactivatedRoutes) {
    const routing = router.getRouting(deactivatedRoute.id);
    if (routing.rules !== undefined) {
      for (let rule of routing.rules) {
        resolve.push(
          rule.resolve({
            status: 'deactivated',
            location: nextLocation,
            prevLocation: prevLocation,
            prevRoute: createRuleRoute(deactivatedRoute, router),
            prevRoutes: createRuleRoutes(prevRoutes, router),
            store,
          })
        );
      }
    }
  }
  for (const [prevUpdatedRoute, nextUpdateRoute] of updatedRoutes) {
    const routing = router.getRouting(nextUpdateRoute.id);
    if (routing.rules !== undefined) {
      for (let rule of routing.rules) {
        resolve.push(
          rule.resolve({
            status: 'updated',
            location: nextLocation,
            prevLocation: prevLocation,
            route: createRuleRoute(nextUpdateRoute, router),
            routes: createRuleRoutes(nextRoutes, router),
            prevRoute: createRuleRoute(prevUpdatedRoute, router),
            prevRoutes: createRuleRoutes(prevRoutes, router),
            store,
          })
        );
      }
    }
  }
  for (const activatedRoute of activatedRoutes) {
    const routing = router.getRouting(activatedRoute.id);
    if (routing.rules !== undefined) {
      for (let rule of routing.rules) {
        resolve.push(
          rule.resolve({
            status: 'activated',
            location: nextLocation,
            prevLocation: prevLocation,
            route: createRuleRoute(activatedRoute, router),
            routes: createRuleRoutes(nextRoutes, router),
            store,
          })
        );
      }
    }
  }
  return concat(...resolve);
}

function createCommitObservable<TNamespace extends string, TConfig>(
  store: Store<any>,
  router: Router<TNamespace, TConfig>,
  nextLocation: Location,
  prevLocation: Location | undefined,
  nextRoutes: ActiveRoute<any, any, any>[],
  prevRoutes: ActiveRoute<any, any, any>[],
  updatedRoutes: [ActiveRoute<any, any, any>, ActiveRoute<any, any, any>][],
  activatedRoutes: ActiveRoute<any, any, any>[],
  deactivatedRoutes: ActiveRoute<any, any, any>[]
) {
  const commit: Observable<void>[] = [];
  for (const deactivatedRoute of deactivatedRoutes) {
    const routing = router.getRouting(deactivatedRoute.id);
    if (routing.rules !== undefined) {
      for (let rule of routing.rules) {
        commit.push(
          rule.commit({
            status: 'deactivated',
            location: nextLocation,
            prevLocation: prevLocation,
            prevRoute: createRuleRoute(deactivatedRoute, router),
            prevRoutes: createRuleRoutes(prevRoutes, router),
            store,
          })
        );
      }
    }
  }
  for (const [prevUpdatedRoute, nextUpdateRoute] of updatedRoutes) {
    const routing = router.getRouting(nextUpdateRoute.id);
    if (routing.rules !== undefined) {
      for (let rule of routing.rules) {
        commit.push(
          rule.commit({
            status: 'updated',
            location: nextLocation,
            prevLocation: prevLocation,
            route: createRuleRoute(nextUpdateRoute, router),
            routes: createRuleRoutes(nextRoutes, router),
            prevRoute: createRuleRoute(prevUpdatedRoute, router),
            prevRoutes: createRuleRoutes(prevRoutes, router),
            store,
          })
        );
      }
    }
  }
  for (const activatedRoute of activatedRoutes) {
    const routing = router.getRouting(activatedRoute.id);
    if (routing.rules !== undefined) {
      for (let rule of routing.rules) {
        commit.push(
          rule.commit({
            status: 'activated',
            location: nextLocation,
            prevLocation: prevLocation,
            route: createRuleRoute(activatedRoute, router),
            routes: createRuleRoutes(nextRoutes, router),
            store,
          })
        );
      }
    }
  }
  return concat(...commit);
}

function createEvents<TNamespace extends string, TConfig>(
  nextLocation: Location,
  prevLocation: Location | undefined,
  nextRoutes: ActiveRoute<any, any, any>[],
  prevRoutes: ActiveRoute<any, any, any>[],
  updatedRoutes: [ActiveRoute<any, any, any>, ActiveRoute<any, any, any>][],
  activatedRoutes: ActiveRoute<any, any, any>[],
  deactivatedRoutes: ActiveRoute<any, any, any>[]
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

function createRuleRoutes(
  routes: ActiveRoute<any, any, any>[],
  router: Router<any, any>
): ActiveRouting<any, any, any, any, any>[] {
  return routes.map((route) => createRuleRoute(route, router));
}

function createNavigateObservable<TNamespace extends string, TState, TConfig>(
  action: Action<NavigationRequested>,
  actions: Observable<Action<any>>,
  router: Router<TNamespace, TConfig>,
  getRouterState: StateSelectorFunction<
    Record<TNamespace, RouterState>,
    [],
    RouterState
  >,
  store: Store<Record<TNamespace, RouterState>>
) {
  return new Observable<Action<any>>((subscriber) => {
    {
      const { payload } = action;
      const prevState = getRouterState(store.getState());
      const prevLocation = prevState.location;
      const prevRoutes = prevState.routes ?? [];
      const nextLocation = payload.location;
      const nextRoutes = matchRoutes(router, nextLocation);
      const { updatedRoutes, activatedRoutes, deactivatedRoutes } = diffRoutes(
        prevRoutes,
        nextRoutes
      );
      subscriber.next(
        router.actions.NavigationStarted({
          origin: payload.origin,
          location: nextLocation,
          state: payload.state,
          key: payload.key,
          routes: nextRoutes,
        })
      );
      const resolve = createResolveObservable(
        store,
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
        store,
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
        actions.pipe(filter(router.actions.NavigationRequested.is)).subscribe({
          next() {
            if (!redirected) {
              subscriber.next(
                router.actions.NavigationCanceled({
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
                  router.actions.NavigationCanceled({
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
                  router.actions.NavigationCanceled({
                    reason: 'redirected',
                    origin: payload.origin,
                    location: nextLocation,
                    state: payload.state,
                    key: payload.key,
                    routes: nextRoutes,
                  })
                );
                subscriber.next(
                  router.actions.NavigationRequested({
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
                  events.map(router.actions.RouteResolved),
                  commit.pipe(ignoreElements()),
                  events.map(router.actions.RouteCommitted),
                  of(
                    router.actions.NavigationCompleted({
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

export function createRouterEffect<TNamespace extends string, TConfig>(
  router: Router<TNamespace, TConfig>
) {
  const getRouterState = createSelectorFunction(router.selectors.selectState);
  return createEffect({
    namespace: router.namespace,
    storeState: typeOf<Record<TNamespace, RouterState>>(),
    effects: {
      createNewNavigationRequest(actions) {
        return actions.pipe(
          filter(router.actions.Navigate.is),
          map(({ payload }) =>
            router.actions.NavigationRequested({
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
            return router.actions.NavigationRequested({
              origin: 'pop',
              location: entry.location,
              state,
              key,
            });
          })
        );
      },
      handleNavigationRequest(actions, store) {
        return actions
          .pipe(filter(router.actions.NavigationRequested.is))
          .pipe(
            concatMap((action) =>
              createNavigateObservable(
                action,
                actions,
                router,
                getRouterState,
                store
              )
            )
          );
      },
      syncHistoryAfterNavigationCompleted(actions) {
        return actions.pipe(
          filter(router.actions.NavigationCompleted.is),
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
      syncHistoryAfterNavigationCancelled(actions, store) {
        return actions.pipe(
          filter(router.actions.NavigationCanceled.is),
          tap(({ payload }) => {
            if (payload.origin === 'pop' && payload.reason === 'intercepted') {
              const state = getRouterState(store.getState());
              const historyState = { state: state.state, key: state.key };
              router.history.newEntry(state.location, historyState, {
                mode: 'replace',
              });
            }
          }),
          ignoreElements()
        );
      },
    },
  });
}
