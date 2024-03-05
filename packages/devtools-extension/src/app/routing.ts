import { selectTargetState } from '@app/selectors/insights-selectors';
import {
  createRouteConfigComponent,
  Location,
  Route,
  RouteActionTypes,
  RouteObject,
  Router,
  RoutingRule,
} from '@lib/state-fx/store-router';
import {
  concat,
  EMPTY,
  first,
  ignoreElements,
  isObservable,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import {
  appBarRoute,
  dashboardRoute,
  fallbackRoute,
  rootRoute,
  statusRoute,
  targetRoute,
} from '@app/routes';
import { routerActions } from '@app/router';
import { ReactRouterConfig } from '../lib/state-fx/store-router-react';
import { AppBarWrapper } from '@app/pages/app-bar-wrapper';
import { InstrumentationStatusPage } from '@app/pages/instrumentation-status-page';
import { TargetPage } from '@app/pages/target-page';
import { DashboardPage } from '@app/pages/dashboard-page';
import { createSelection } from '../lib/state-fx/store/selection';
import { selectInstrumentationStatus } from '@app/selectors/status-selectors';
import {
  ActivatedRouteCommand,
  DeactivatedRouteCommand,
  UpdatedRouteCommand,
} from '../lib/state-fx/store-router/route-command';
import { dashboardRouteActions, targetRouteActions } from '@app/router-actions';
import {
  Fn,
  getQueryHash,
  ResourceActionTypes,
  ResourceKey,
  ResourceState,
} from '@lib/state-fx/store-resource';
import { Store } from '@lib/state-fx/store';
import {
  insightsQueryKeys,
  insightsResourceActions,
  insightsResourceStoreComponent,
} from '@app/store/insights/insights-resource';

function toObservable<T>(result: Observable<T> | T): Observable<T> {
  if (isObservable(result)) {
    return result;
  } else {
    return of(result);
  }
}

function canActivate<TData, TParams, TSearch, THash>(
  fn: (
    context: ActivatedRouteCommand<TParams, TSearch, THash>,
    router: Router<TData>
  ) => boolean | Observable<boolean>
): RoutingRule<TData, TParams, TSearch, THash> {
  return {
    check(context, router) {
      if (context.type === 'activate') {
        return toObservable(fn(context, router)).pipe(
          switchMap((result) =>
            result
              ? EMPTY
              : of(
                  routerActions.cancelNavigation({
                    reason: 'guard.canActivate',
                  })
                )
          )
        );
      } else {
        return EMPTY;
      }
    },
  };
}

function canDeactivate<TData, TParams, TSearch, THash>(
  fn: (
    context: DeactivatedRouteCommand<TParams, TSearch, THash>,
    router: Router<TData>
  ) => boolean | Observable<boolean>
): RoutingRule<TData, TParams, TSearch, THash> {
  return {
    check(context, router) {
      if (context.type === 'deactivate') {
        return toObservable(fn(context, router)).pipe(
          switchMap((result) =>
            result
              ? EMPTY
              : of(
                  routerActions.cancelNavigation({
                    reason: 'guard.canDeactivate',
                  })
                )
          )
        );
      } else {
        return EMPTY;
      }
    },
  };
}

function resolve<TData, TParams, TSearch, THash>(
  fn: (
    context:
      | ActivatedRouteCommand<TParams, TSearch, THash>
      | UpdatedRouteCommand<TParams, TSearch, THash>,
    router: Router<TData>
  ) => Observable<unknown>
): RoutingRule<TData, TParams, TSearch, THash> {
  return {
    commit(context, router) {
      if (context.type === 'activate' || context.type === 'activate-update') {
        return fn(context, router).pipe(ignoreElements());
      } else {
        return EMPTY;
      }
    },
  };
}

function resource<TData, TParams, TSearch, THash, TFn extends Fn>(
  resourceActions: ResourceActionTypes,
  resourceStore: Store<ResourceState>,
  queryKey: ResourceKey<TFn>,
  getQueryArgs: (route: RouteObject<TParams, TSearch, THash>) => Parameters<TFn>
): RoutingRule<TData, TParams, TSearch, THash> {
  const subscriberKey = crypto.randomUUID();
  return {
    prepare(context, router) {
      if (context.type === 'activate' || context.type === 'activate-update') {
        return of(
          resourceActions.prefetchQuery({
            queryKey: queryKey,
            queryArgs: getQueryArgs(context.activatedRoute),
          })
        );
      } else {
        return EMPTY;
      }
    },
    commit(context, router) {
      if (context.type === 'activate' || context.type === 'activate-update') {
        const queryArgs = getQueryArgs(context.activatedRoute);
        const queryHash = getQueryHash(queryKey, queryArgs);
        return concat(
          of(
            resourceActions.subscribeQuery({
              subscriberKey,
              queryKey,
              queryArgs,
            })
          ),
          resourceStore.getStateObservable().pipe(
            first((state) => state.queries[queryHash]?.data !== undefined),
            ignoreElements()
          )
        );
      } else {
        return of(
          resourceActions.unsubscribeQuery({
            subscriberKey,
            queryKey: queryKey,
            queryArgs: getQueryArgs(context.deactivatedRoute),
          })
        );
      }
    },
  };
}

function redirect<TData, TParams, TSearch, THash>(
  fn: (
    context: DeactivatedRouteCommand<TParams, TSearch, THash>,
    router: Router<TData>
  ) => Location | Observable<Location>
): RoutingRule<TData, TParams, TSearch, THash> {
  return {
    check(context, router) {
      if (context.type === 'deactivate') {
        return toObservable(fn(context, router)).pipe(
          switchMap((result) =>
            result
              ? EMPTY
              : of(
                  routerActions.navigate({
                    location: result,
                  })
                )
          )
        );
      } else {
        return EMPTY;
      }
    },
  };
}

function dispatchRouteActions<TParams, TSearch, THash>(
  routeActions: RouteActionTypes<TParams, TSearch, THash>
): RoutingRule<unknown, TParams, TSearch, THash> {
  return {
    check(context, router, routerStore) {
      return of(
        routeActions.routeChecked({
          ...context,
          routerState: routerStore.getState(),
        })
      );
    },
    prepare(context, router, routerStore) {
      return of(
        routeActions.routePrepared({
          ...context,
          routerState: routerStore.getState(),
        })
      );
    },
    commit(context, router, routerStore) {
      return of(
        routeActions.routeCommitted({
          ...context,
          routerState: routerStore.getState(),
        })
      );
    },
  };
}

export const appRouterConfigComponent = createRouteConfigComponent(
  ({
    instrumentationStatus,
    targetState,
    insightsResourceStore,
  }): ReactRouterConfig => ({
    route: rootRoute,
    children: [
      {
        route: statusRoute,
        data: {
          component: InstrumentationStatusPage,
        },
        rules: [
          canActivate(() => instrumentationStatus.getResult() !== 'installed'),
          canDeactivate(
            () => instrumentationStatus.getResult() === 'installed'
          ),
        ],
      },
      {
        route: dashboardRoute,
        data: {
          component: DashboardPage,
        },
        rules: [dispatchRouteActions(dashboardRouteActions)],
      },
      {
        route: appBarRoute,
        data: {
          component: AppBarWrapper,
        },
        children: [
          <ReactRouterConfig<typeof targetRoute>>{
            route: targetRoute,
            data: {
              component: TargetPage,
            },
            rules: [
              dispatchRouteActions(targetRouteActions),
              resource(
                insightsResourceActions,
                insightsResourceStore,
                insightsQueryKeys.getTargetState,
                (route) => [route.params.targetId] as [number]
              ),
              resolve(({ activatedRoute }) =>
                targetState.pipe(
                  first(
                    () =>
                      targetState.getResult(activatedRoute.params.targetId) !==
                      undefined
                  )
                )
              ),
            ],
          },
        ],
      },
      {
        route: fallbackRoute,
        rules: [redirect(() => statusRoute())],
      },
    ],
  }),
  {
    instrumentationStatus: createSelection(selectInstrumentationStatus),
    targetState: createSelection(selectTargetState),
    insightsResourceStore: insightsResourceStoreComponent,
  }
);
