import {
  Action,
  createActions,
  createEffect,
  createSelectorFunction,
  StateSelectorFunction,
  Store,
  typeOf,
} from '../store';
import { Navigate, RouteEvent, RouterActions } from './router-actions';
import { Router } from './router';
import { Path } from 'history';
import { ActiveRoute } from './active-route';
import {
  concat,
  concatMap,
  filter,
  ignoreElements,
  Observable,
  of,
} from 'rxjs';
import { ActiveRouting } from './routing';
import { RouterState } from './router-reducer';
import { diffRoutes } from './diff-routes';

function matchRoutes<TConfig>(router: Router<any, TConfig>, path: Path) {
  const matches = router.match(path.pathname);
  const routes: ActiveRoute<any, any, any>[] = [];
  let params = {};
  for (const match of matches) {
    params = { ...params, ...match.params };
    routes.push({
      id: match.routing.id,
      path: match.path,
      params: params,
      search: match.routing.route.search?.decode(path.search).value,
      hash: match.routing.route.hash?.decode(path.hash).value,
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
  nextPath: Path,
  prevPath: Path | undefined,
  nextRoutes: ActiveRoute<any, any, any>[],
  prevRoutes: ActiveRoute<any, any, any>[],
  updatedRoutes: [ActiveRoute<any, any, any>, ActiveRoute<any, any, any>][],
  activatedRoutes: ActiveRoute<any, any, any>[],
  deactivatedRoutes: ActiveRoute<any, any, any>[]
) {
  const resolve: Observable<Path | boolean>[] = [];
  for (const deactivatedRoute of deactivatedRoutes) {
    const routing = router.getRouting(deactivatedRoute.id);
    if (routing.rules !== undefined) {
      for (let rule of routing.rules) {
        resolve.push(
          rule.resolve({
            status: 'deactivated',
            path: nextPath,
            prevPath: prevPath,
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
            path: nextPath,
            prevPath: prevPath,
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
            path: nextPath,
            prevPath: prevPath,
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
  nextPath: Path,
  prevPath: Path | undefined,
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
            path: nextPath,
            prevPath: prevPath,
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
            path: nextPath,
            prevPath: prevPath,
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
            path: nextPath,
            prevPath: prevPath,
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
  nextPath: Path,
  prevPath: Path | undefined,
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
      deactivatedPath: prevPath!,
      deactivatedRoute: deactivatedRoute,
      deactivatedRoutes: prevRoutes,
    });
  }
  for (const [prevUpdatedRoute, nextUpdateRoute] of updatedRoutes) {
    events.push({
      status: 'updated',
      activatedPath: nextPath,
      activatedRoute: prevUpdatedRoute,
      activatedRoutes: nextRoutes,
      deactivatedPath: prevPath,
      deactivatedRoute: nextUpdateRoute,
      deactivatedRoutes: prevRoutes,
    });
  }
  for (const activatedRoute of activatedRoutes) {
    events.push({
      status: 'activated',
      activatedPath: nextPath,
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
  action: Action<Navigate>,
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
      const prevPath = prevState.location;
      const prevRoutes = prevState.routes ?? [];
      const nextPath = payload.path;
      const nextRoutes = matchRoutes(router, nextPath);
      const { updatedRoutes, activatedRoutes, deactivatedRoutes } = diffRoutes(
        prevRoutes,
        nextRoutes
      );
      subscriber.next(
        router.actions.NavigationStarted({
          path: nextPath,
          routes: nextRoutes,
        })
      );
      const resolve = createResolveObservable(
        store,
        router,
        nextPath,
        prevPath,
        nextRoutes,
        prevRoutes,
        updatedRoutes,
        activatedRoutes,
        deactivatedRoutes
      );
      const commit = createCommitObservable(
        store,
        router,
        nextPath,
        prevPath,
        nextRoutes,
        prevRoutes,
        updatedRoutes,
        activatedRoutes,
        deactivatedRoutes
      );
      const events = createEvents(
        nextPath,
        prevPath,
        nextRoutes,
        prevRoutes,
        updatedRoutes,
        activatedRoutes,
        deactivatedRoutes
      );

      let redirected = false;

      subscriber.add(
        actions.pipe(filter(router.actions.Navigate.is)).subscribe({
          next() {
            if (!redirected) {
              subscriber.next(
                router.actions.NavigationCanceled({
                  reason: 'overridden',
                  path: nextPath,
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
                    path: nextPath,
                    routes: nextRoutes,
                  })
                );
                subscriber.complete();
              } else {
                redirected = true;
                subscriber.next(
                  router.actions.NavigationCanceled({
                    reason: 'redirected',
                    path: nextPath,
                    routes: nextRoutes,
                  })
                );
                subscriber.next(
                  router.actions.Navigate({
                    path: value,
                  })
                );
                subscriber.complete();
              }
            },
            error(error) {
              subscriber.next(
                router.actions.NavigationErrored({
                  reason:
                    error?.message !== undefined
                      ? String(error.message)
                      : String(error),
                  path: nextPath,
                  routes: nextRoutes,
                })
              );
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
                      path: nextPath,
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

export function createRouterEffect<TNamespace extends string, TConfig>(
  router: Router<TNamespace, TConfig>
) {
  const getRouterState = createSelectorFunction(router.selectors.selectState);
  return createEffect({
    namespace: router.namespace,
    storeState: typeOf<Record<TNamespace, RouterState>>(),
    effects: {
      navigate(actions, store) {
        return actions
          .pipe(filter(router.actions.Navigate.is))
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
    },
  });
}
