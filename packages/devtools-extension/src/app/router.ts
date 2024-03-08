import {
  createMemoryHistory,
  createRouterHarness,
  createRouterSelectors,
} from '@lib/state-fx/store-router';
import {
  UrlParamsEncoder,
  UrlParamsMerger,
} from '../lib/state-fx/store-router/url-params-encoder';
import {
  UrlParamEncoder,
  UrlParamMerger,
} from '../lib/state-fx/store-router/url-param-encoder';
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
  searchMerger: new UrlParamsMerger(),
  hashEncoder: new UrlParamEncoder(),
  hashMerger: new UrlParamMerger(),
});
export const { selectRouterState, selectRoute } = createRouterSelectors({
  store: routerStoreComponent,
});
