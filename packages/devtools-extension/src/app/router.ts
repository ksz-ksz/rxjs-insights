import {
  createRouter,
  createRouteToken,
  createUrl,
  RouterConfig,
} from '@lib/store-router';
import { JSXElementConstructor } from 'react';
import { Store } from '@lib/store';
import { statusSelector, StatusSlice } from '@app/store/status';

export const statusRouteToken = createRouteToken('status');
export const dashboardRouteToken = createRouteToken('dashboard');
export const appBarRouteToken = createRouteToken('appBar');
export const observableRouteToken = createRouteToken('observable');
export const subscriberRouteToken = createRouteToken('subscriber');

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
      token: statusRouteToken,
      path: ['status'],
      interceptEnter(store: Store<StatusSlice>) {
        return store.get(statusSelector).instrumentationStatus !== 'installed';
      },
      interceptLeave(store: Store<StatusSlice>) {
        return store.get(statusSelector).instrumentationStatus === 'installed';
      },
    },
    {
      token: appBarRouteToken,
      path: [],
      children: [
        {
          token: dashboardRouteToken,
          path: ['dashboard'],
        },
        {
          token: observableRouteToken,
          path: ['observable', ':observableId'],
        },
        {
          token: subscriberRouteToken,
          path: ['subscriber', ':subscriberId'],
        },
      ],
    },
  ],
};

export const router = createRouter('router', routerConfig);
