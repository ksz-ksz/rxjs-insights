import {
  Action,
  Actions,
  actionsComponent,
  ActionTypes,
  Component,
  Container,
  createEffect,
  Effect,
  ComponentInstance,
  StateSelectorFunction,
  Store,
  StoreComponent,
} from '../store';
import { Router, RouterComponent } from './router';
import { RouteConfig, RouteContext, RoutingRule } from './route-config';
import { History, HistoryEntry, Location, PopEntryListener } from './history';
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
import {
  NavigationRequested,
  RouteEvent,
  RouterActions,
} from './router-actions';
import { RouterState } from './router-store';
import { ComponentsResolver } from './components-resolver';
import { RouteObject } from './route-object';
import { diffRoutes } from './diff-routes';

export interface CreateRoutingOptions<TData, TSearchInput, THashInput> {
  router: RouterComponent<TData, TSearchInput, THashInput>;
  routerStore: StoreComponent<RouterState>;
  routerActions: ActionTypes<RouterActions>;
  routerConfig: RouteConfig<TData, TSearchInput, THashInput>;
}

export function fromHistory(history: History): Observable<HistoryEntry> {
  return new Observable((observer) => {
    const listener: PopEntryListener = (entry) => {
      observer.next(entry);
    };

    history.addPopEntryListener(listener);

    return () => {
      history.removePopEntryListener(listener);
    };
  });
}

export interface Routing extends Effect {}

export interface RoutingComponent extends Component<Routing> {}

function matchRoutes<TData, TSearchInput, THashInput>(
  router: Router<TData, TSearchInput, THashInput>,
  location: Location
) {
  const matches = router.match(location.pathname);
  const decodedSearch = router.searchEncoder.decode(location.search);
  const decodedHash = router.hashEncoder.decode(location.hash);
  const routes: RouteObject<any, any, any>[] = [];
  let params = {};
  for (const match of matches) {
    params = { ...params, ...match.params };
    routes.push({
      id: match.routeConfig.route.id,
      path: match.path,
      params: params,
      search: decodedSearch.valid
        ? match.routeConfig.route.search?.decode(decodedSearch.value).value
        : undefined,
      hash: decodedHash.valid
        ? match.routeConfig.route.hash?.decode(decodedHash.value).value
        : undefined,
    });
  }
  return routes;
}

function createRouteContext<TData, TSearchInput, THashInput>(
  route: RouteObject,
  router: Router<TData, TSearchInput, THashInput>
): RouteContext<TData> {
  return {
    route,
    routeConfig: router.getRouteConfig(route.id),
  };
}

function createResolveObservable<
  TNamespace extends string,
  TData,
  TSearchInput,
  THashInput
>(
  routingRulesResolver: ComponentsResolver<RoutingRule<TData>>,
  router: Router<TData, TSearchInput, THashInput>,
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
        const resolvedRule = routingRulesResolver.resolveData(rule);
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
        const resolvedRule = routingRulesResolver.resolveData(rule);
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
        const resolvedRule = routingRulesResolver.resolveData(rule);
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

function createCommitObservable<
  TNamespace extends string,
  TData,
  TSearchInput,
  THashInput
>(
  routingRulesResolver: ComponentsResolver<RoutingRule<TData>>,
  router: Router<TData, TSearchInput, THashInput>,
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
        const resolvedRule = routingRulesResolver.resolveData(rule);
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
        const resolvedRule = routingRulesResolver.resolveData(rule);
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
        const resolvedRule = routingRulesResolver.resolveData(rule);
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
      activatedRoute: nextUpdateRoute,
      activatedRoutes: nextRoutes,
      deactivatedLocation: prevLocation,
      deactivatedRoute: prevUpdatedRoute,
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
  router: Router<TData, unknown, unknown>
): RouteContext<TData>[] {
  return routes.map((route) => createRouteContext(route, router));
}

function createNavigateObservable<TState, TData, TSearchInput, THashInput>(
  routingRulesResolver: ComponentsResolver<RoutingRule<TData>>,
  action: Action<NavigationRequested>,
  actions: Actions,
  router: Router<TData, TSearchInput, THashInput>,
  routerActions: ActionTypes<RouterActions>,
  routerStore: Store<RouterState>
) {
  return new Observable<Action<any>>((subscriber) => {
    {
      const { payload } = action;
      const prevState = routerStore.getState();
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

function createRoutingInstance<TData, TSearchInput, THashInput>(
  actions: Actions,
  router: Router<TData, TSearchInput, THashInput>,
  routerStore: Store<RouterState>,
  routerActions: ActionTypes<RouterActions>,
  routingRulesResolver: ComponentsResolver<RoutingRule<TData>>
): Routing {
  {
    return createEffect(
      'router',
      actions,
      {},
      {
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
        syncHistoryAfterNavigationCancelled(actions) {
          return actions.ofType(routerActions.NavigationCanceled).pipe(
            tap(({ payload }) => {
              if (
                payload.origin === 'pop' &&
                payload.reason === 'intercepted'
              ) {
                const state = routerStore.getState();
                const historyState = { state: state.state, key: state.key };
                router.history.newEntry(state.location, historyState, {
                  mode: 'replace',
                });
              }
            }),
            ignoreElements()
          );
        },
      }
    );
  }
}

function createRoutingComponent<TData, TSearchInput, THashInput>(
  router: RouterComponent<TData, TSearchInput, THashInput>,
  routerStore: StoreComponent<RouterState>,
  routerActions: ActionTypes<RouterActions>,
  routerConfig: RouteConfig<TData, TSearchInput, THashInput>
): RoutingComponent {
  return {
    init(container: Container): ComponentInstance<Routing> {
      // refactor to component with deps
      const actionsRef = container.use(actionsComponent);
      const routerRef = container.use(router);
      const routerStoreRef = container.use(routerStore);
      const routingRulesResolver = new ComponentsResolver<RoutingRule<TData>>(
        container
      );

      routerRef.component.init(routerConfig);

      const routing = createRoutingInstance(
        actionsRef.component,
        routerRef.component,
        routerStoreRef.component,
        routerActions,
        routingRulesResolver
      );

      return {
        component: routing,
        dispose() {
          routing.dispose();
          actionsRef.release();
          routerStoreRef.release();
          routingRulesResolver.dispose();
        },
      };
    },
  };
}

export function createRouting<TData, TSearchInput, THashInput>({
  router,
  routerActions,
  routerStore,
  routerConfig,
}: CreateRoutingOptions<TData, TSearchInput, THashInput>): RoutingComponent {
  return createRoutingComponent(
    router,
    routerStore,
    routerActions,
    routerConfig
  );
}
