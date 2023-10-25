import { Location } from './history';
import { RouteObject } from './route-object';
import { ActionTypes, createStore, StoreComponent, tx, typeOf } from '../store';
import { RouterActions } from './router-actions';

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
): StoreComponent<RouterState> {
  const { namespace, actions } = options;
  return createStore({
    namespace,
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
    update: tx([actions.NavigationCompleted], (state, { payload }) => {
      state.location = payload.location;
      state.state = payload.state;
      state.key = payload.key;
      state.origin = payload.origin;
      state.routes = payload.routes;
    }),
  });
}
