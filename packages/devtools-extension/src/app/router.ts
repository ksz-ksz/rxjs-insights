import {
  createMemoryHistory,
  createRouter,
  createRouterSelectors,
  createRouterStore,
  RouterActions,
} from '@lib/state-fx/store-router';
import { createActions } from '@lib/state-fx/store';

export const router = createRouter({
  history: createMemoryHistory(),
});

export const routerActions = createActions<RouterActions>({
  namespace: 'router',
});

export const routerStore = createRouterStore({
  namespace: 'router',
  actions: routerActions,
});

export const { selectRouterState, selectRoute } = createRouterSelectors({
  store: routerStore,
});
