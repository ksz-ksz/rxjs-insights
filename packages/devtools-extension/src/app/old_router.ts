import {
  createRouter,
  createRouteToken,
  createUrl,
  RouterConfig,
} from '@lib/store-router';
import { JSXElementConstructor } from 'react';
import { Store } from '@lib/store';
import { statusSelector, StatusSlice } from '@app/store/status';
import { selectTargetState } from '@app/selectors/insights-selectors';

// FIXME: remove this file and all references

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
        return (
          store.select(statusSelector).get().instrumentationStatus !==
          'installed'
        );
      },
      interceptLeave(store: Store<StatusSlice>) {
        return (
          store.select(statusSelector).get().instrumentationStatus ===
          'installed'
        );
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
            return store.select(
              selectTargetState(Number(route.params!.targetId))
            );
          },
        },
      ],
    },
  ],
};

export const old_router = createRouter('router', routerConfig);
