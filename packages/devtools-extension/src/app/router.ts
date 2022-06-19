import {
  createRouter,
  createRouteToken,
  createUrl,
  RouterConfig,
} from '@lib/store-router';
import { JSXElementConstructor } from 'react';
import { select, Store } from '@lib/store';
import { statusSelector, StatusSlice } from '@app/store/status';
import { targetStateSelector } from '@app/selectors/insights-selectors';

export const statusRouteToken = createRouteToken('status');
export const dashboardRouteToken = createRouteToken('dashboard');
export const appBarRouteToken = createRouteToken('appBar');
export const targetRouteToken = createRouteToken('target');

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
          token: targetRouteToken,
          path: ['target', ':targetId'],
          await(store, url, route) {
            return store.pipe(
              select(targetStateSelector(Number(route.params!.targetId)))
            );
          },
        },
      ],
    },
  ],
};

export const router = createRouter('router', routerConfig);
