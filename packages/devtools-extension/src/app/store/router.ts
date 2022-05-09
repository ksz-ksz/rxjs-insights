import { createReaction, filterActions, Store } from '@lib/store';
import { statusActions, statusSelectors, StatusSlice } from '@app/store/status';
import { createRouter, createUrl, Routing } from '@lib/store-router';
import { JSXElementConstructor, ReactNode } from 'react';

import { StatusPage } from '../pages/status-page';
import { DashboardPage } from '../pages/dashboard-page';
import { map } from 'rxjs';

const routing: Routing<void, { component: JSXElementConstructor<any> }> = {
  routes: [
    {
      path: [],
      interceptEnter: () => createUrl(['status']),
    },
    {
      path: ['status'],
      metadata: {
        component: StatusPage,
      },
      interceptEnter(store: Store<StatusSlice>) {
        return store.get(statusSelectors.instrumentationStatus) !== 'installed';
      },
      interceptLeave(store: Store<StatusSlice>) {
        return store.get(statusSelectors.instrumentationStatus) === 'installed';
      },
    },
    {
      path: ['dashboard'],
      metadata: {
        component: DashboardPage,
      },
    },
    // {
    //   path: ['observable', ':observableId'],
    //   metadata: {
    //     element: ObservablePage,
    //   },
    // },
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
  routerActions,
  routerSelectors,
  routerReducer,
  routerReaction,
  getRouteConfig,
} = createRouter('router', routing);
