import { SelectorContext, StoreComponent } from '@lib/state-fx/store';
import { Route } from './route';
import { RouterState } from './router-store';
import { RouteObject } from './route-object';
import {
  createStoreSuperSelector,
  createSuperSelector,
} from '../store/super-selector';

export type SelectRoute = {
  deps: StoreComponent<string, any>[];
  <TParams, TSearch, THash>(
    context: SelectorContext<{
      get(x: StoreComponent<string, RouterState>): RouterState;
    }>,
    ...args: [Route<TParams, TSearch, THash>]
  ): RouteObject<TParams, TSearch, THash> | undefined;
};

export interface CreateRouterSelector<TNamespace extends string> {
  store: StoreComponent<TNamespace, RouterState>;
}

export function createRouterSelectors<TNamespace extends string>(
  options: CreateRouterSelector<TNamespace>
) {
  const { store } = options;
  const selectRouterState = createStoreSuperSelector(store);
  const selectRoute = createSuperSelector(
    [selectRouterState],
    <TParams, TSearch, THash>(
      context: SelectorContext<{
        get(x: StoreComponent<string, RouterState>): RouterState;
      }>,
      route: Route<TParams, TSearch, THash>
    ) => {
      const state = selectRouterState(context);
      return state.routes.find(({ id }) => id === route.id);
    }
  );

  return {
    selectRouterState,
    selectRoute,
  };
}
