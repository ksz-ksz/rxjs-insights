import { selectTargetState } from '@app/selectors/insights-selectors';
import {
  createRouteConfigComponent,
  Location,
  Router,
  RoutingRule,
} from '@lib/state-fx/store-router';
import {
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

export const appRouterConfigComponent = createRouteConfigComponent(
  ({ instrumentationStatus, targetState }): ReactRouterConfig => ({
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
              resolve(({ activatedRoute }) =>
                targetState.pipe(
                  tap((X) => console.log('tap', X)),
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
  }
);
