import { Router } from './router';
import {
  ActivatedRouteEvent,
  DeactivatedRouteEvent,
  RouterActionTypes,
  UpdatedRouteEvent,
} from './router-actions';
import { RouterState } from './router-store';
import {
  concat,
  concatMap,
  ignoreElements,
  merge,
  Observable,
  of,
  takeUntil,
} from 'rxjs';
import { Action, Actions, createEffect } from '@lib/state-fx/store';
import { RouteObject } from './route-object';
import { Location } from './history';
import {
  ActivatedRoutingRuleEvent,
  DeactivatedRoutingRuleEvent,
  RouteContext,
  RoutingRule,
  RoutingRuleEvent,
  UpdatedRoutingRuleEvent,
} from './route-config';
import { diffRoutes } from './diff-routes';

function collectRules<TData>(
  check: Observable<Action>[],
  commit: Observable<Action>[],
  resolve: Observable<void>[],
  rules: RoutingRule<TData>[],
  context: RoutingRuleEvent<TData>
) {
  for (const rule of rules) {
    if (rule.dispatchOnCheck !== undefined) {
      check.push(rule.dispatchOnCheck(context));
    }
    if (rule.dispatchOnCommit !== undefined) {
      commit.push(rule.dispatchOnCommit(context));
    }
    if (rule.resolve !== undefined) {
      resolve.push(rule.resolve(context));
    }
  }
}

function collectDeactivatedRoutes<TData, TSearchInput, THashInput>(
  router: Router<TData, TSearchInput, THashInput>,
  routerActions: RouterActionTypes,
  routerState: RouterState,
  check: Observable<Action>[],
  commit: Observable<Action>[],
  resolve: Observable<void>[],
  deactivatedRoutes: RouteObject[],
  nextLocation: Location,
  prevLocation: Location,
  prevRoutes: RouteObject[]
) {
  for (let i = deactivatedRoutes.length - 1; i >= 0; i--) {
    const deactivatedRoute = deactivatedRoutes[i];
    const routing = router.getRouteConfig(deactivatedRoute.id);
    if (routing.rules !== undefined) {
      const context: DeactivatedRoutingRuleEvent<TData> = {
        type: 'deactivate',
        activatedLocation: nextLocation,
        deactivatedLocation: prevLocation,
        deactivatedRoute: createRouteContext(router, deactivatedRoute),
        deactivatedRoutes: createRouteContexts(router, prevRoutes),
        routerState,
      };
      collectRules(check, commit, resolve, routing.rules, context);
    }
    const event: DeactivatedRouteEvent = {
      type: 'deactivate',
      activatedLocation: nextLocation,
      deactivatedLocation: prevLocation,
      deactivatedRoute: deactivatedRoute,
      deactivatedRoutes: prevRoutes,
      routerState,
    };
    check.push(of(routerActions.routeChecked(event)));
    commit.push(of(routerActions.routeCommitted(event)));
  }
}

function collectDeactivateUpdateRoutes<TData, TSearchInput, THashInput>(
  router: Router<TData, TSearchInput, THashInput>,
  routerActions: RouterActionTypes,
  routerState: RouterState,
  check: Observable<Action>[],
  commit: Observable<Action>[],
  resolve: Observable<void>[],
  updatedRoutes: [RouteObject, RouteObject][],
  nextLocation: Location,
  nextRoutes: RouteObject<any, any, any>[],
  prevLocation: Location,
  prevRoutes: RouteObject[]
) {
  for (let i = updatedRoutes.length - 1; i >= 0; i--) {
    const [prevUpdatedRoute, nextUpdateRoute] = updatedRoutes[i];
    const routing = router.getRouteConfig(nextUpdateRoute.id);
    if (routing.rules !== undefined) {
      const context: UpdatedRoutingRuleEvent<TData> = {
        type: 'deactivate-update',
        activatedLocation: nextLocation,
        activatedRoute: createRouteContext(router, nextUpdateRoute),
        activatedRoutes: createRouteContexts(router, nextRoutes),
        deactivatedLocation: prevLocation,
        deactivatedRoute: createRouteContext(router, prevUpdatedRoute),
        deactivatedRoutes: createRouteContexts(router, prevRoutes),
        routerState,
      };
      collectRules(check, commit, resolve, routing.rules, context);
    }
    const event: UpdatedRouteEvent = {
      type: 'deactivate-update',
      activatedLocation: nextLocation,
      activatedRoute: nextUpdateRoute,
      activatedRoutes: nextRoutes,
      deactivatedLocation: prevLocation,
      deactivatedRoute: prevUpdatedRoute,
      deactivatedRoutes: prevRoutes,
      routerState,
    };
    check.push(of(routerActions.routeChecked(event)));
    commit.push(of(routerActions.routeCommitted(event)));
  }
}

function collectActivateUpdateRoutes<TData, TSearchInput, THashInput>(
  router: Router<TData, TSearchInput, THashInput>,
  routerActions: RouterActionTypes,
  routerState: RouterState,
  check: Observable<Action>[],
  commit: Observable<Action>[],
  resolve: Observable<void>[],
  updatedRoutes: [RouteObject, RouteObject][],
  nextLocation: Location,
  nextRoutes: RouteObject<any, any, any>[],
  prevLocation: Location,
  prevRoutes: RouteObject[]
) {
  for (const [prevUpdatedRoute, nextUpdateRoute] of updatedRoutes) {
    const routing = router.getRouteConfig(nextUpdateRoute.id);
    if (routing.rules !== undefined) {
      const context: UpdatedRoutingRuleEvent<TData> = {
        type: 'activate-update',
        activatedLocation: nextLocation,
        activatedRoute: createRouteContext(router, nextUpdateRoute),
        activatedRoutes: createRouteContexts(router, nextRoutes),
        deactivatedLocation: prevLocation,
        deactivatedRoute: createRouteContext(router, prevUpdatedRoute),
        deactivatedRoutes: createRouteContexts(router, prevRoutes),
        routerState,
      };
      collectRules(check, commit, resolve, routing.rules, context);
    }
    const event: UpdatedRouteEvent = {
      type: 'activate-update',
      activatedLocation: nextLocation,
      activatedRoute: nextUpdateRoute,
      activatedRoutes: nextRoutes,
      deactivatedLocation: prevLocation,
      deactivatedRoute: prevUpdatedRoute,
      deactivatedRoutes: prevRoutes,
      routerState,
    };
    check.push(of(routerActions.routeChecked(event)));
    commit.push(of(routerActions.routeCommitted(event)));
  }
}

function collectActivatedRoutes<TData, TSearchInput, THashInput>(
  router: Router<TData, TSearchInput, THashInput>,
  routerActions: RouterActionTypes,
  routerState: RouterState,
  check: Observable<Action>[],
  commit: Observable<Action>[],
  resolve: Observable<void>[],
  activatedRoutes: RouteObject[],
  nextLocation: Location,
  nextRoutes: RouteObject<any, any, any>[],
  prevLocation: Location
) {
  for (const activatedRoute of activatedRoutes) {
    const routing = router.getRouteConfig(activatedRoute.id);
    if (routing.rules !== undefined && routing.rules.length !== 0) {
      const context: ActivatedRoutingRuleEvent<TData> = {
        type: 'activate',
        activatedLocation: nextLocation,
        activatedRoute: createRouteContext(router, activatedRoute),
        activatedRoutes: createRouteContexts(router, nextRoutes),
        deactivatedLocation: prevLocation,
        routerState,
      };
      collectRules(check, commit, resolve, routing.rules, context);
    }
    const event: ActivatedRouteEvent = {
      type: 'activate',
      deactivatedLocation: prevLocation,
      activatedLocation: nextLocation,
      activatedRoute: activatedRoute,
      activatedRoutes: nextRoutes,
      routerState,
    };
    check.push(of(routerActions.routeChecked(event)));
    commit.push(of(routerActions.routeCommitted(event)));
  }
}

export function createRouterController<TData, TSearchInput, THashInput>(
  name: string,
  actions: Actions,
  router: Router<TData, TSearchInput, THashInput>,
  routerActions: RouterActionTypes
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
              const resolve: Observable<void>[] = [];
              collectDeactivatedRoutes(
                router,
                routerActions,
                routerState,
                check,
                commit,
                resolve,
                deactivatedRoutes,
                nextLocation,
                prevLocation,
                prevRoutes
              );
              collectDeactivateUpdateRoutes(
                router,
                routerActions,
                routerState,
                check,
                commit,
                resolve,
                updatedRoutes,
                nextLocation,
                nextRoutes,
                prevLocation,
                prevRoutes
              );
              collectActivateUpdateRoutes(
                router,
                routerActions,
                routerState,
                check,
                commit,
                resolve,
                updatedRoutes,
                nextLocation,
                nextRoutes,
                prevLocation,
                prevRoutes
              );
              collectActivatedRoutes(
                router,
                routerActions,
                routerState,
                check,
                commit,
                resolve,
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
              const abort = merge(
                actions.ofType(routerActions.navigationRequested),
                actions.ofType(routerActions.navigationCancelled)
              );
              return concat(
                of(
                  routerActions.startNavigation(payload),
                  routerActions.startCheckPhase(payload)
                ),
                concat(...check).pipe(takeUntil(abort)),
                of(
                  routerActions.completeCheckPhase(payload),
                  routerActions.startCommitPhase(payload)
                ),
                merge(
                  ...commit,
                  merge(...resolve).pipe(ignoreElements(), takeUntil(abort))
                ),
                of(
                  routerActions.completeCommitPhase(payload),
                  routerActions.completeNavigation(payload)
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

function createRouteContext(
  router: Router<unknown>,
  route: RouteObject
): RouteContext<unknown> {
  return {
    route,
    routeConfig: router.getRouteConfig(route.id),
  };
}

function createRouteContexts(
  router: Router<unknown>,
  routes: RouteObject[]
): RouteContext<unknown>[] {
  return routes.map((route) => createRouteContext(router, route));
}
