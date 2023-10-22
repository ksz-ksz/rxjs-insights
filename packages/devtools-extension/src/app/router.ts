import {
  createMemoryHistory,
  createRouter,
  createRouterSelectors,
  createRouterStore,
  RouterActions,
} from '@lib/state-fx/store-router';
import { createActions } from '@lib/state-fx/store';
import { UrlParamsEncoder } from '../lib/state-fx/store-router/url-params-encoder';
import { UrlParamEncoder } from '../lib/state-fx/store-router/url-param-encoder';
import { RouterData } from '../lib/state-fx/store-router-react';

export const router = createRouter<RouterData>({
  history: createMemoryHistory(),
  searchEncoder: new UrlParamsEncoder(),
  hashEncoder: new UrlParamEncoder(),
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
