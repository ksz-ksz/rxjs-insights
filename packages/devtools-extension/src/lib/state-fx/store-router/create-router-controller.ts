import { Router } from './router';
import { RouterActionTypes } from './router-actions';
import { RouterState } from './router-store';
import {
  BehaviorSubject,
  concat,
  concatMap,
  defer,
  EMPTY,
  filter,
  merge,
  Observable,
  of,
  takeUntil,
  tap,
} from 'rxjs';
import { Action, Actions, createEffect, Store } from '@lib/state-fx/store';
import { RouteObject } from './route-object';
import { Location } from './history';
import { RoutingRule } from './route-config';
import { diffRoutes } from './diff-routes';
import { connectSubject } from './connect-subject';
import {
  ActivatedRouteCommand,
  DeactivatedRouteCommand,
  RouteCommand,
  UpdatedRouteCommand,
} from './route-command';

function collectRules<TData>(
  check: Observable<Action>[],
  prepare: Observable<Action>[],
  commit: Observable<Action>[],
  rules: RoutingRule<TData>[],
  command: RouteCommand,
  router: Router<TData>
) {
  for (const rule of rules) {
    if (rule.check !== undefined) {
      check.push(defer(() => rule.check!(command, router)));
    }
    if (rule.prepare !== undefined) {
      prepare.push(defer(() => rule.prepare!(command, router)));
    }
    if (rule.commit !== undefined) {
      commit.push(defer(() => rule.commit!(command, router)));
    }
  }
}

function collectEvents(
  check: Observable<Action>[],
  prepare: Observable<Action>[],
  commit: Observable<Action>[],
  routerActions: RouterActionTypes,
  event: RouteCommand
) {
  check.push(of(routerActions.checkRoute(event)));
  prepare.push(of(routerActions.prepareRoute(event)));
  commit.push(of(routerActions.commitRoute(event)));
}

function collectDeactivatedRoutes<TData, TSearchInput, THashInput>(
  router: Router<TData, TSearchInput, THashInput>,
  routerActions: RouterActionTypes,
  routerStore: Store<RouterState>,
  check: Observable<Action>[],
  commit: Observable<Action>[],
  prepare: Observable<Action>[],
  deactivatedRoutes: RouteObject[],
  nextLocation: Location,
  prevLocation: Location,
  prevRoutes: RouteObject[]
) {
  for (let i = deactivatedRoutes.length - 1; i >= 0; i--) {
    const deactivatedRoute = deactivatedRoutes[i];
    const routing = router.getRouteConfig(deactivatedRoute.id);
    const event: DeactivatedRouteCommand = {
      type: 'deactivate',
      activatedLocation: nextLocation,
      deactivatedLocation: prevLocation,
      deactivatedRoute: deactivatedRoute,
      deactivatedRoutes: prevRoutes,
    };
    if (routing.rules !== undefined) {
      collectRules(check, prepare, commit, routing.rules, event, router);
    }
    collectEvents(check, prepare, commit, routerActions, event);
  }
}

function collectDeactivateUpdateRoutes<TData, TSearchInput, THashInput>(
  router: Router<TData, TSearchInput, THashInput>,
  routerActions: RouterActionTypes,
  routerStore: Store<RouterState>,
  check: Observable<Action>[],
  commit: Observable<Action>[],
  prepare: Observable<Action>[],
  updatedRoutes: [RouteObject, RouteObject][],
  nextLocation: Location,
  nextRoutes: RouteObject<any, any, any>[],
  prevLocation: Location,
  prevRoutes: RouteObject[]
) {
  for (let i = updatedRoutes.length - 1; i >= 0; i--) {
    const [prevUpdatedRoute, nextUpdateRoute] = updatedRoutes[i];
    const routing = router.getRouteConfig(nextUpdateRoute.id);
    const event: UpdatedRouteCommand = {
      type: 'deactivate-update',
      activatedLocation: nextLocation,
      activatedRoute: nextUpdateRoute,
      activatedRoutes: nextRoutes,
      deactivatedLocation: prevLocation,
      deactivatedRoute: prevUpdatedRoute,
      deactivatedRoutes: prevRoutes,
    };
    if (routing.rules !== undefined) {
      collectRules(check, prepare, commit, routing.rules, event, router);
    }
    collectEvents(check, prepare, commit, routerActions, event);
  }
}

function collectActivateUpdateRoutes<TData, TSearchInput, THashInput>(
  router: Router<TData, TSearchInput, THashInput>,
  routerActions: RouterActionTypes,
  routerStore: Store<RouterState>,
  check: Observable<Action>[],
  commit: Observable<Action>[],
  prepare: Observable<Action>[],
  updatedRoutes: [RouteObject, RouteObject][],
  nextLocation: Location,
  nextRoutes: RouteObject<any, any, any>[],
  prevLocation: Location,
  prevRoutes: RouteObject[]
) {
  for (const [prevUpdatedRoute, nextUpdateRoute] of updatedRoutes) {
    const routing = router.getRouteConfig(nextUpdateRoute.id);
    const event: UpdatedRouteCommand = {
      type: 'activate-update',
      activatedLocation: nextLocation,
      activatedRoute: nextUpdateRoute,
      activatedRoutes: nextRoutes,
      deactivatedLocation: prevLocation,
      deactivatedRoute: prevUpdatedRoute,
      deactivatedRoutes: prevRoutes,
    };
    if (routing.rules !== undefined) {
      collectRules(check, prepare, commit, routing.rules, event, router);
    }
    collectEvents(check, prepare, commit, routerActions, event);
  }
}

function collectActivatedRoutes<TData, TSearchInput, THashInput>(
  router: Router<TData, TSearchInput, THashInput>,
  routerActions: RouterActionTypes,
  routerStore: Store<RouterState>,
  check: Observable<Action>[],
  commit: Observable<Action>[],
  prepare: Observable<Action>[],
  activatedRoutes: RouteObject[],
  nextLocation: Location,
  nextRoutes: RouteObject<any, any, any>[],
  prevLocation: Location
) {
  for (const activatedRoute of activatedRoutes) {
    const routing = router.getRouteConfig(activatedRoute.id);
    const event: ActivatedRouteCommand = {
      type: 'activate',
      deactivatedLocation: prevLocation,
      activatedLocation: nextLocation,
      activatedRoute: activatedRoute,
      activatedRoutes: nextRoutes,
    };
    if (routing.rules !== undefined && routing.rules.length !== 0) {
      collectRules(check, prepare, commit, routing.rules, event, router);
    }
    collectEvents(check, prepare, commit, routerActions, event);
  }
}

export function createRouterController<TData, TSearchInput, THashInput>(
  name: string,
  actions: Actions,
  router: Router<TData, TSearchInput, THashInput>,
  routerActions: RouterActionTypes,
  routerStore: Store<RouterState>
) {
  return createEffect(actions, {
    name,
    effects: {
      navigate(actions) {
        return actions.ofType(routerActions.navigationRequested).pipe(
          concatMap(
            ({ payload: { origin, key, location, state, routerState } }) => {
              const prevLocation = routerState.location;
              const nextLocation = location;
              const prevRoutes = routerState.routes;
              const nextRoutes = matchRoutes(router, nextLocation);
              const { updatedRoutes, activatedRoutes, deactivatedRoutes } =
                diffRoutes(prevRoutes, nextRoutes);
              const check: Observable<Action>[] = [];
              const commit: Observable<Action>[] = [];
              const prepare: Observable<Action>[] = [];
              collectDeactivatedRoutes(
                router,
                routerActions,
                routerStore,
                check,
                commit,
                prepare,
                deactivatedRoutes,
                nextLocation,
                prevLocation,
                prevRoutes
              );
              collectDeactivateUpdateRoutes(
                router,
                routerActions,
                routerStore,
                check,
                commit,
                prepare,
                updatedRoutes,
                nextLocation,
                nextRoutes,
                prevLocation,
                prevRoutes
              );
              collectActivateUpdateRoutes(
                router,
                routerActions,
                routerStore,
                check,
                commit,
                prepare,
                updatedRoutes,
                nextLocation,
                nextRoutes,
                prevLocation,
                prevRoutes
              );
              collectActivatedRoutes(
                router,
                routerActions,
                routerStore,
                check,
                commit,
                prepare,
                activatedRoutes,
                nextLocation,
                nextRoutes,
                prevLocation
              );
              const payload = {
                origin,
                key,
                location,
                state,
                routes: nextRoutes,
              };
              return merge(
                actions.ofType(routerActions.navigationRequested),
                actions.ofType(routerActions.navigationCancelled)
              ).pipe(
                connectSubject(
                  (abort) => {
                    return concat(
                      concat(
                        of(routerActions.startNavigation(payload)),
                        concat(...check),
                        of(routerActions.completeCheck(payload)),
                        merge(...prepare),
                        of(routerActions.completePrepare(payload))
                      ).pipe(
                        takeUntil(
                          abort.pipe(
                            tap((x) => console.log('TAKEUNTIL', x)),
                            filter((value) => value !== undefined)
                          )
                        )
                      ),
                      defer(() =>
                        abort.getValue() !== undefined
                          ? EMPTY
                          : concat(
                              merge(...commit),
                              of(routerActions.completeNavigation(payload))
                            )
                      )
                    );
                  },
                  {
                    connector: () =>
                      new BehaviorSubject<Action | undefined>(undefined),
                  }
                )
              );
            }
          )
        );
      },
    },
  });
}

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
