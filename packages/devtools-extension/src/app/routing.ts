import { statusSelector } from '@app/store/status';
import { targetStateSelector } from '@app/selectors/insights-selectors';
import {
  ActivatedRoutingRuleContext,
  createRouteConfigFactory,
  createRouting,
  DeactivatedRoutingRuleContext,
  Location,
  RoutingRule,
  RoutingRuleContext,
  UpdatedRoutingRuleContext,
} from '@lib/state-fx/store-router';
import { EMPTY, ignoreElements, isObservable, Observable, of } from 'rxjs';
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
import { RouterData } from '../lib/state-fx/store-router-react/router-data';
import { AppBarWrapper } from '@app/pages/app-bar-wrapper';
import { InstrumentationStatusPage } from '@app/pages/instrumentation-status-page';
import { TargetPage } from '@app/pages/target-page';
import { DashboardPage } from '@app/pages/dashboard-page';

const createRouteConfig = createRouteConfigFactory<
  RouterData,
  UrlParams,
  string
>();

function redirect<TState, TConfig, TParams, TSearch, THash>(
  fn: (
    context: ActivatedRoutingRuleContext<TConfig, TParams, TSearch, THash>
  ) => Location | Observable<Location>
): RoutingRule<TConfig, TParams, TSearch, THash> {
  return {
    check(
      context: RoutingRuleContext<TConfig, TParams, TSearch, THash>
    ): Observable<Location | boolean> {
      if (context.status === 'activated') {
        const location = fn(context);
        if (isObservable(location)) {
          return location;
        } else {
          return of(location);
        }
      } else {
        return of(true);
      }
    },
  };
}

function canActivate<TState, TConfig, TParams, TSearch, THash>(
  fn: (
    context: ActivatedRoutingRuleContext<TConfig, TParams, TSearch, THash>
  ) => boolean | Observable<boolean>
): RoutingRule<TConfig, TParams, TSearch, THash> {
  return {
    check(
      context: RoutingRuleContext<TConfig, TParams, TSearch, THash>
    ): Observable<Location | boolean> {
      if (context.status === 'activated') {
        const result = fn(context);
        if (isObservable(result)) {
          return result;
        } else {
          return of(result);
        }
      } else {
        return of(true);
      }
    },
  };
}

function canDeactivate<TConfig, TParams, TSearch, THash>(
  fn: (
    context: DeactivatedRoutingRuleContext<TConfig, TParams, TSearch, THash>
  ) => boolean | Observable<boolean>
): RoutingRule<TConfig, TParams, TSearch, THash> {
  return {
    check(
      context: RoutingRuleContext<TConfig, TParams, TSearch, THash>
    ): Observable<Location | boolean> {
      if (context.status === 'deactivated') {
        const result = fn(context);
        if (isObservable(result)) {
          return result;
        } else {
          return of(result);
        }
      } else {
        return of(true);
      }
    },
  };
}

function activate<TConfig, TParams, TSearch, THash>(
  fn: (
    context:
      | ActivatedRoutingRuleContext<TConfig, TParams, TSearch, THash>
      | UpdatedRoutingRuleContext<TConfig, TParams, TSearch, THash>
  ) => Observable<unknown>
): RoutingRule<TConfig, TParams, TSearch, THash> {
  return {
    commit(
      context: RoutingRuleContext<TConfig, TParams, TSearch, THash>
    ): Observable<void> {
      if (context.status === 'activated' || context.status === 'updated') {
        return fn(context).pipe(ignoreElements());
      } else {
        return EMPTY;
      }
    },
  };
}

const routerConfig = createRouteConfig(rootRoute, {
  children: [
    createRouteConfig(statusRoute, {
      data: {
        component: InstrumentationStatusPage,
      },
      rules: [
        canActivate(({ store }) => {
          // FIXME
          return (
            store.select(statusSelector).get().instrumentationStatus !==
            'installed'
          );
        }),
        canDeactivate(({ store }) => {
          // FIXME
          return (
            store.select(statusSelector).get().instrumentationStatus ===
            'installed'
          );
        }),
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
            activate(({ store, route }) => {
              // FIXME
              return store.select(
                targetStateSelector(route.route.params.targetId)
              );
            }),
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
