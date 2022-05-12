import { createReaction, filterActions, Store } from '@lib/store';
import { createRouter, createUrl, Routing } from '@lib/store-router';
import { JSXElementConstructor, ReactNode } from 'react';

import { InstrumentationStatusPage } from '../pages/instrumentation-status-page';
import { DashboardPage } from '../pages/dashboard-page';
import { map } from 'rxjs';
import { ObservablePage } from '../pages/observable-page';
import { StatusSlice } from '@app/store/status/slice';
import { statusActions } from '@app/store/status/actions';
import { statusSelectors } from '@app/store/status/selectors';
import { AppBarShell } from '@app/pages/app-bar-shell';
import { routesActions } from '@app/store/routes';

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
        return store.get(statusSelectors.instrumentationStatus) !== 'installed';
      },
      interceptLeave(store: Store<StatusSlice>) {
        return store.get(statusSelectors.instrumentationStatus) === 'installed';
      },
    },
    {
      path: [],
      metadata: {
        component: AppBarShell,
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
