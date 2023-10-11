import { statusSelector } from '@app/store/status';
import { targetStateSelector } from '@app/selectors/insights-selectors';
import {
  ActivatedRoutingRuleContext,
  createRouteConfigFactory,
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

const createRouting = createRouteConfigFactory<unknown, unknown>();

function redirect<TState, TConfig, TParams, TSearch, THash>(
  fn: (
    context: ActivatedRoutingRuleContext<
      TState,
      TConfig,
      TParams,
      TSearch,
      THash
    >
  ) => Location | Observable<Location>
): RoutingRule<TState, TConfig, TParams, TSearch, THash> {
  return {
    check(
      context: RoutingRuleContext<TState, TConfig, TParams, TSearch, THash>
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
    context: ActivatedRoutingRuleContext<
      TState,
      TConfig,
      TParams,
      TSearch,
      THash
    >
  ) => boolean | Observable<boolean>
): RoutingRule<TState, TConfig, TParams, TSearch, THash> {
  return {
    check(
      context: RoutingRuleContext<TState, TConfig, TParams, TSearch, THash>
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

function canDeactivate<TState, TConfig, TParams, TSearch, THash>(
  fn: (
    context: DeactivatedRoutingRuleContext<
      TState,
      TConfig,
      TParams,
      TSearch,
      THash
    >
  ) => boolean | Observable<boolean>
): RoutingRule<TState, TConfig, TParams, TSearch, THash> {
  return {
    check(
      context: RoutingRuleContext<TState, TConfig, TParams, TSearch, THash>
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

function activate<TState, TConfig, TParams, TSearch, THash>(
  fn: (
    context:
      | ActivatedRoutingRuleContext<TState, TConfig, TParams, TSearch, THash>
      | UpdatedRoutingRuleContext<TState, TConfig, TParams, TSearch, THash>
  ) => Observable<unknown>
): RoutingRule<TState, TConfig, TParams, TSearch, THash> {
  return {
    commit(
      context: RoutingRuleContext<TState, TConfig, TParams, TSearch, THash>
    ): Observable<void> {
      if (context.status === 'activated' || context.status === 'updated') {
        return fn(context).pipe(ignoreElements());
      } else {
        return EMPTY;
      }
    },
  };
}

export const routing = createRouting(rootRoute, {
  children: [
    createRouting(statusRoute, {
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
    createRouting(dashboardRoute),
    createRouting(appBarRoute, {
      children: [
        createRouting(targetRoute, {
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
    createRouting(fallbackRoute, {
      rules: [redirect(() => statusRoute())],
    }),
  ],
});
