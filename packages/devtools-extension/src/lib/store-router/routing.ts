import { Action, ActionFactory, Store } from '@lib/store';
import { Route } from './route';
import { Url } from './url';

export interface RouteConfig<DATA, METADATA> {
  path: string[];
  data?: DATA;
  metadata?: METADATA;
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

export interface Routing<DATA = void, METADATA = void> {
  routes?: RouteConfig<DATA, METADATA>[];
  transitions?: RouteTransitionConfig<DATA, unknown>[];
}

export function transition<DATA, PAYLOAD>(
  action: ActionFactory<PAYLOAD>,
  transition: (
    store: Store<any>,
    route: Route<DATA>,
    action: Action<PAYLOAD>
  ) => Url | void
): RouteTransitionConfig<DATA, PAYLOAD> {
  return { action, transition };
}
