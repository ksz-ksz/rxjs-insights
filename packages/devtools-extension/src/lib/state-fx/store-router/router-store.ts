import { Location } from './history';
import { RouteObject } from './route-object';
import { ActionTypes, Component } from '../store';
import { RouterActions, RouterActionTypes } from './router-actions';
import { createStoreComponent, Store, StoreDef, tx } from '../store/store';

export interface RouterState {
  navigationState: 'navigating' | 'idle';
  navigationPhase: 'check' | 'prepare' | 'complete' | undefined;
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

export function createRouterStoreComponent(
  name: string,
  actions: RouterActionTypes
): Component<Store<RouterState>> {
  return createStoreComponent(
    (): StoreDef<RouterState> => ({
      name,
      state: {
        navigationState: 'idle',
        navigationPhase: undefined,
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
        startNavigation: tx([actions.startNavigation], (state) => {
          state.navigationState = 'navigating';
          state.navigationPhase = 'check';
        }),
        completeCheck: tx([actions.completeCheck], (state) => {
          state.navigationPhase = 'prepare';
        }),
        completePrepare: tx([actions.completePrepare], (state) => {
          state.navigationPhase = 'complete';
        }),
        completeNavigation: tx(
          [actions.completeNavigation],
          (state, { payload: payload }) => {
            state.navigationState = 'idle';
            state.navigationPhase = undefined;
            state.location = payload.location;
            state.state = payload.state;
            state.key = payload.key;
            state.origin = payload.origin;
            state.routes = payload.routes;
          }
        ),
        cancelNavigation: tx([actions.cancelNavigation], (state) => {
          state.navigationState = 'idle';
          state.navigationPhase = undefined;
        }),
      },
    })
  );
}
