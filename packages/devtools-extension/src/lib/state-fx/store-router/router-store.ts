import { Location } from './history';
import { RouteObject } from './route-object';
import { ActionTypes, Component } from '../store';
import { RouterActions } from './router-actions';
import { createStoreComponent, Store, StoreDef, tx } from '../store/store';

export interface RouterState {
  location: Location;
  state: any;
  key: string;
  origin: 'pop' | 'push' | 'replace';
  routes: RouteObject<any, any, any>[];
}
export interface CreateRouterStoreOptions {
  namespace: string;
  actions: ActionTypes<RouterActions>;
}

export function createRouterStore(
  options: CreateRouterStoreOptions
): Component<Store<RouterState>> {
  const { namespace: name, actions } = options;
  return createStoreComponent(
    (): StoreDef<RouterState> => ({
      name,
      state: {
        location: {
          pathname: '',
          search: '',
          hash: '',
        },
        state: null,
        key: 'default',
        origin: 'pop',
        routes: [],
      },
      transitions: {
        update: tx([actions.NavigationCompleted], (state, { payload }) => {
          state.location = payload.location;
          state.state = payload.state;
          state.key = payload.key;
          state.origin = payload.origin;
          state.routes = payload.routes;
        }),
      },
    })
  );
}
