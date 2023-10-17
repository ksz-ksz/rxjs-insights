import {
  createSelector,
  Selector,
  SelectorContext,
  SelectorState,
  StoreComponent,
  StoreState,
} from '@lib/state-fx/store';
import { Router, RouterComponent } from './router';
import { createStoreSelector } from '../store/store-selector';
import { Route } from './route';
import { RouterState } from './router-store';
import { RouteObject } from './route-object';

type SelectRoute<TNamespace extends string> = {
  <TParams, TSearch, THash>(
    context: SelectorContext<{ [K in TNamespace]: RouterState }>,
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
  const selectRouterState: Selector<
    { [K in TNamespace]: RouterState },
    [],
    RouterState
  > = createStoreSelector(store);
  const selectRoute: SelectRoute<TNamespace> = createSelector(
    <TParams, TSearch, THash>(
      context: SelectorContext<{ [K in TNamespace]: RouterState }>,
      route: Route<TParams, TSearch, THash>
    ) => {
      const state = selectRouterState(context);
      return state.routes.find(({ id }) => id === route.id) as
        | RouteObject<TParams, TSearch, THash>
        | undefined;
    }
  );

  return {
    selectRouterState,
    selectRoute,
  };
}
