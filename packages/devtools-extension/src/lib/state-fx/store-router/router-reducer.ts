import { createReducerFromActions, Reducer, typeOf } from '../store';
import { Location } from './history';
import { ActiveRoute } from './active-route';
import { Router } from './router';

export interface RouterState {
  location: Location;
  state: any;
  key: string;
  origin: 'pop' | 'push' | 'replace';
  routes: ActiveRoute<any, any, any>[];
}
export interface CreateRouterReducerOptions<TNamespace extends string> {
  router: Router<TNamespace, any>;
}

export function createRouterReducer<TNamespace extends string>({
  router,
}: CreateRouterReducerOptions<TNamespace>): Reducer<
  TNamespace,
  RouterState,
  unknown
> {
  const [reducer] = createReducerFromActions({
    namespace: router.namespace,
    initialState: typeOf<RouterState>({
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
    reducers: (reducer) => ({
      navigationCompleted: reducer({
        action: [router.actions.NavigationCompleted],
        reduce: (state, { payload }) => {
          state.location = payload.location;
          state.state = payload.state;
          state.key = payload.key;
          state.origin = payload.origin;
          state.routes = payload.routes;
        },
      }),
    }),
  });

  return reducer;
}
