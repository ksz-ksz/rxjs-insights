import { selectTargetState } from '@app/selectors/insights-selectors';
import {
  ActivatedRoutingRuleContext,
  createRouteConfigFactory,
  createRouting,
  createRoutingRule,
  DeactivatedRoutingRuleContext,
  Location,
  RoutingRule,
  RoutingRuleContext,
  UpdatedRoutingRuleContext,
} from '@lib/state-fx/store-router';
import {
  EMPTY,
  first,
  ignoreElements,
  isObservable,
  Observable,
  of,
} from 'rxjs';
import {
  appBarRoute,
  dashboardRoute,
  fallbackRoute,
  rootRoute,
  statusRoute,
  targetRoute,
} from '@app/routes';
import { router, routerActions, routerStore } from '@app/router';
import { UrlParams } from '../lib/state-fx/store-router/url-params';
import { RouterData } from '../lib/state-fx/store-router-react';
import { AppBarWrapper } from '@app/pages/app-bar-wrapper';
import { InstrumentationStatusPage } from '@app/pages/instrumentation-status-page';
import { TargetPage } from '@app/pages/target-page';
import { DashboardPage } from '@app/pages/dashboard-page';
import { Component, Deps } from '@lib/state-fx/store';
import { createSelection } from '../lib/state-fx/store/selection';
import { selectInstrumentationStatus } from '@app/selectors/status-selectors';

const createRouteConfig = createRouteConfigFactory<
  RouterData,
  UrlParams,
  string
>();

function redirect<TDeps, TData, TParams, TSearch, THash>(
  fn: (
    context: ActivatedRoutingRuleContext<TData, TParams, TSearch, THash>,
    deps: TDeps
  ) => Location | Observable<Location>,
  depsComponents?: Deps<TDeps>
): Component<RoutingRule<TData, TParams, TSearch, THash>> {
  return createRoutingRule(
    (deps) => ({
      check(
        context: RoutingRuleContext<TData, TParams, TSearch, THash>
      ): Observable<Location | boolean> {
        if (context.status === 'activated') {
          const location = fn(context, deps);
          if (isObservable(location)) {
            return location;
          } else {
            return of(location);
          }
        } else {
          return of(true);
        }
      },
    }),
    depsComponents
  );
}

function canActivate<TDeps, TData, TParams, TSearch, THash>(
  fn: (
    context: ActivatedRoutingRuleContext<TData, TParams, TSearch, THash>,
    deps: TDeps
  ) => boolean | Observable<boolean>,
  depsComponents?: Deps<TDeps>
): Component<RoutingRule<TData, TParams, TSearch, THash>> {
  return createRoutingRule(
    (deps) => ({
      check(
        context: RoutingRuleContext<TData, TParams, TSearch, THash>
      ): Observable<Location | boolean> {
        if (context.status === 'activated') {
          const result = fn(context, deps);
          if (isObservable(result)) {
            return result;
          } else {
            return of(result);
          }
        } else {
          return of(true);
        }
      },
    }),
    depsComponents
  );
}

function canDeactivate<TDeps, TData, TParams, TSearch, THash>(
  fn: (
    context: DeactivatedRoutingRuleContext<TData, TParams, TSearch, THash>,
    deps: TDeps
  ) => boolean | Observable<boolean>,
  depsComponents?: Deps<TDeps>
): Component<RoutingRule<TData, TParams, TSearch, THash>> {
  return createRoutingRule(
    (deps) => ({
      check(
        context: RoutingRuleContext<TData, TParams, TSearch, THash>
      ): Observable<Location | boolean> {
        if (context.status === 'deactivated') {
          const result = fn(context, deps);
          if (isObservable(result)) {
            return result;
          } else {
            return of(result);
          }
        } else {
          return of(true);
        }
      },
    }),
    depsComponents
  );
}

function activate<TDeps, TData, TParams, TSearch, THash>(
  fn: (
    context:
      | ActivatedRoutingRuleContext<TData, TParams, TSearch, THash>
      | UpdatedRoutingRuleContext<TData, TParams, TSearch, THash>,
    deps: TDeps
  ) => Observable<unknown>,
  depsComponents?: Deps<TDeps>
): Component<RoutingRule<TData, TParams, TSearch, THash>> {
  return createRoutingRule(
    (deps) => ({
      commit(
        context: RoutingRuleContext<TData, TParams, TSearch, THash>
      ): Observable<void> {
        if (context.status === 'activated' || context.status === 'updated') {
          return fn(context, deps).pipe(ignoreElements());
        } else {
          return EMPTY;
        }
      },
    }),
    depsComponents
  );
}

const routerConfig = createRouteConfig(rootRoute, {
  children: [
    createRouteConfig(statusRoute, {
      data: {
        component: InstrumentationStatusPage,
      },
      rules: [
        canActivate(
          (context, { instrumentationStatus }) =>
            instrumentationStatus.getResult() !== 'installed',
          {
            instrumentationStatus: createSelection(selectInstrumentationStatus),
          }
        ),
        canDeactivate(
          (context, { instrumentationStatus }) =>
            instrumentationStatus.getResult() === 'installed',
          {
            instrumentationStatus: createSelection(selectInstrumentationStatus),
          }
        ),
      ],
    }),
    createRouteConfig(dashboardRoute, {
      data: {
        component: DashboardPage,
      },
    }),
    createRouteConfig(appBarRoute, {
      data: {
        component: AppBarWrapper,
      },
      children: [
        createRouteConfig(targetRoute, {
          data: {
            component: TargetPage,
          },
          rules: [
            activate(
              ({ route }, { targetState }) =>
                targetState.pipe(
                  first(
                    () =>
                      targetState.getResult(route.route.params.targetId) !==
                      undefined
                  )
                ),
              {
                targetState: createSelection(selectTargetState),
              }
            ),
          ],
        }),
      ],
    }),
    createRouteConfig(fallbackRoute, {
      rules: [redirect(() => statusRoute())],
    }),
  ],
});

export const routing = createRouting({
  router,
  routerActions,
  routerStore,
  routerConfig,
});
