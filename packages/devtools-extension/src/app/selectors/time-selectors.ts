import {
  SelectorContext,
  SelectorContextFromDeps,
  StoreComponent,
} from '@lib/state-fx/store';
import { routerStore } from '@app/router';
import { targetRoute } from '@app/routes';
import {
  createStoreSuperSelector,
  createSuperSelector,
  StoreEntry,
} from '../../lib/state-fx/store/super-selector';
import { Route, RouteObject, RouterState } from '@lib/state-fx/store-router';

export const routerStoreSuperSelector = createStoreSuperSelector(routerStore);

export type RouteSuperSelector = {
  <TParams, TSearch, THash>(
    context: SelectorContext<StoreEntry<RouterState>>,
    ...args: [Route<TParams, TSearch, THash>]
  ): RouteObject<TParams, TSearch, THash> | undefined;
  deps: StoreComponent<string, any>[];
};

export const routeSuperSelector: RouteSuperSelector = createSuperSelector(
  [routerStoreSuperSelector],
  <TParams, TSearch, THash>(
    context: SelectorContextFromDeps<[typeof routerStoreSuperSelector]>,
    route: Route<TParams, TSearch, THash>
  ) => {
    const state = routerStoreSuperSelector(context);
    return state.routes.find(({ id }) => id === route.id) as
      | RouteObject<TParams, TSearch, THash>
      | undefined;
  }
);

// TODO: impl changed
export const selectTime = createSuperSelector(
  [routerStoreSuperSelector],
  (ctx) => {
    const route = routeSuperSelector(ctx, targetRoute);
    return route?.search?.time ?? 0;
  }
);
