import {
  createMemoryHistory,
  createRouterHarness,
  createRouterSelectors,
} from '@lib/state-fx/store-router';
import { UrlParamsEncoder } from '../lib/state-fx/store-router/url-params-encoder';
import { UrlParamEncoder } from '../lib/state-fx/store-router/url-param-encoder';
import { ReactRouterData } from '../lib/state-fx/store-router-react';
import { UrlParams } from '../lib/state-fx/store-router/url-params';

export const {
  routerActions,
  routerComponent,
  routerConfigComponent,
  routerInitializerComponent,
  routerStoreComponent,
} = createRouterHarness<ReactRouterData, UrlParams, string>({
  name: 'router',
  history: createMemoryHistory(),
  searchEncoder: new UrlParamsEncoder(),
  hashEncoder: new UrlParamEncoder(),
});
export const { selectRouterState, selectRoute } = createRouterSelectors({
  store: routerStoreComponent,
});
