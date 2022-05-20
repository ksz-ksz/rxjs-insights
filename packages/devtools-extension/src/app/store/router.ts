import { createReaction, filterActions, Store } from '@lib/store';
import { createRouter, createUrl, Routing } from '@lib/store-router';
import { JSXElementConstructor, ReactNode } from 'react';

import { InstrumentationStatusPage } from '../pages/instrumentation-status-page';
import { DashboardPage } from '@app/pages/dashboard-page';
import { map } from 'rxjs';
import { ObservablePage } from '@app/pages/observable-page';
import { statusSelector, StatusSlice } from '@app/store/status/slice';
import { statusActions } from '@app/actions/status-actions';
import { AppBarWrapper } from '@app/pages/app-bar-wrapper';
import { routesActions } from '@app/store/routes';
import { SubscriberPage } from '@app/pages/subscriber-page';

const routing: Routing<void, { component: JSXElementConstructor<any> }> = {
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
        {
          path: ['observable', ':observableId'],
          metadata: {
            component: ObservablePage,
          },
        },
        {
          path: ['subscriber', ':subscriberId'],
          metadata: {
            component: SubscriberPage,
          },
        },
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

export const {
  router,
  routerActions,
  routerSelectors,
  routerReducer,
  routerReaction,
} = createRouter('router', routing);
