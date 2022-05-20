import { createReaction, filterActions, Slice, Store } from '@lib/store';
import {
  createRouter,
  createUrl,
  RouteConfig,
  RouterConfig,
  RouterState,
} from '@lib/store-router';
import { JSXElementConstructor } from 'react';

import { InstrumentationStatusPage } from '../pages/instrumentation-status-page';
import { DashboardPage } from '@app/pages/dashboard-page';
import { map } from 'rxjs';
import { ObservablePage } from '@app/pages/observable-page';
import { StatusSlice } from '@app/store/status/slice';
import { statusActions } from '@app/actions/status-actions';
import { AppBarWrapper } from '@app/pages/app-bar-wrapper';
import { routesActions } from '@app/store/routes';
import { SubscriberPage } from '@app/pages/subscriber-page';
import { routerSelectors } from '@app/selectors/router-selectors';
import { routerActions } from '@app/actions/router-actions';
import { statusSelector } from '@app/selectors/status-selectors';

export const observableRoute: RouteConfig<
  void,
  { component: JSXElementConstructor<any> }
> = {
  path: ['observable', ':observableId'],
  metadata: {
    component: ObservablePage,
  },
};

export const subscriberRoute: RouteConfig<
  void,
  { component: JSXElementConstructor<any> }
> = {
  path: ['subscriber', ':subscriberId'],
  metadata: {
    component: SubscriberPage,
  },
};

export const routerConfig: RouterConfig<
  void,
  { component: JSXElementConstructor<any> }
> = {
  routes: [
    {
      path: [],
      interceptEnter: () => createUrl(['status']),
    },
    {
      path: ['status'],
      metadata: {
        component: InstrumentationStatusPage,
      },
      interceptEnter(store: Store<StatusSlice>) {
        return store.get(statusSelector).instrumentationStatus !== 'installed';
      },
      interceptLeave(store: Store<StatusSlice>) {
        return store.get(statusSelector).instrumentationStatus === 'installed';
      },
    },
    {
      path: [],
      metadata: {
        component: AppBarWrapper,
      },
      children: [
        {
          path: ['dashboard'],
          metadata: {
            component: DashboardPage,
          },
          dispatchOnEnter() {
            return routesActions.DashboardRouteEntered();
          },
        },
        observableRoute,
        subscriberRoute,
      ],
    },
    // {
    //   path: ['subscriber', ':subscriberId'],
    //   metadata: {
    //     element: SubscriberPage,
    //   },
    // },
  ],
};

export const routerTransitionsReaction = createReaction((action$) =>
  action$.pipe(
    filterActions(statusActions.InstrumentationStatusResolved),
    map((action) =>
      routerActions.Navigate({
        url:
          action.payload.instrumentationStatus !== 'installed'
            ? createUrl(['status'])
            : createUrl(['dashboard']),
      })
    )
  )
);

export const { router, routerReducer, routerReaction } = createRouter(
  'router',
  routerConfig,
  routerActions,
  routerSelectors
);

export type RouterSlice = Slice<'router', RouterState<void>>;
