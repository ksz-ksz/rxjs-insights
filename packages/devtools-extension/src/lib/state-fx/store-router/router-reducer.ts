import { Location } from './history';
import { ActiveRoute } from './active-route';
import { Router } from './router';
import { Component, createStore, Store, tx, typeOf } from '@lib/state-fx/store';

export interface RouterState {
  location: Location;
  state: any;
  key: string;
  origin: 'pop' | 'push' | 'replace';
  routes: ActiveRoute<any, any, any>[];
}
export interface CreateRouterStoreOptions<TNamespace extends string> {
  router: Router<TNamespace, any>;
}

export function createRouterStore<TNamespace extends string>(
  options: CreateRouterStoreOptions<TNamespace>
): Component<Store<TNamespace, RouterState>> {
  const { router } = options;
  return createStore({
    namespace: router.namespace,
    state: typeOf<RouterState>({
      location: {
        pathname: '',
        search: '',
        hash: '',
      },
      state: null,
      key: 'default',
      origin: 'pop',
      routes: [],
    }),
  })({
    update: tx([router.actions.NavigationCompleted], (state, { payload }) => {
      state.location = payload.location;
      state.state = payload.state;
      state.key = payload.key;
      state.origin = payload.origin;
      state.routes = payload.routes;
    }),
  });
}
