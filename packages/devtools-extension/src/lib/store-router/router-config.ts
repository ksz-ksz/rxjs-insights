import { Action, ActionFactory, Store } from '@lib/store';
import { Route } from './route';
import { Url } from './url';
import { RouteToken } from './route-token';
import { Observable } from 'rxjs';

export interface RouteConfig<DATA, METADATA> {
  path: string[];
  token?: RouteToken;
  data?: DATA;
  metadata?: METADATA;
  await?: (store: Store<any>, url: Url, route: Route<DATA>) => Observable<any>;
  dispatchOnEnter?: (store: Store<any>, url: Url, route: Route<DATA>) => Action;
  dispatchOnLeave?: (store: Store<any>, url: Url, route: Route<DATA>) => Action;
  interceptEnter?: (
    store: Store<any>,
    url: Url,
    route: Route<DATA>
  ) => boolean | Url;
  interceptLeave?: (
    store: Store<any>,
    url: Url,
    route: Route<DATA>
  ) => boolean | Url;
  children?: RouteConfig<DATA, METADATA>[];
}

export interface RouteTransitionConfig<DATA, PAYLOAD> {
  action: ActionFactory<PAYLOAD>;
  transition: (
    store: Store<any>,
    route: Route<DATA>,
    action: Action<PAYLOAD>
  ) => Url | void;
}

export interface RouterConfig<DATA = void, METADATA = void> {
  routes?: RouteConfig<DATA, METADATA>[];
  transitions?: RouteTransitionConfig<DATA, unknown>[];
}
