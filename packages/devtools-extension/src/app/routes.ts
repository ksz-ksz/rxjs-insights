import {
  createRouteFactory,
  Params,
  PathParam,
} from '@lib/state-fx/store-router';
import { z } from 'zod';
import { UrlParamsEncoder } from '../lib/state-fx/store-router/url-params-encoder';
import { UrlParamEncoder } from '../lib/state-fx/store-router/url-param-encoder';

const createRoute = createRouteFactory({
  searchEncoder: new UrlParamsEncoder(),
  hashEncoder: new UrlParamEncoder(),
});

export const rootRoute = createRoute({
  path: '',
});
export const statusRoute = createRoute({
  parent: rootRoute,
  path: 'status',
});
export const dashboardRoute = createRoute({
  parent: rootRoute,
  path: 'dashboard',
});
export const appBarRoute = createRoute({
  parent: rootRoute,
  path: '',
});
export const targetRoute = createRoute({
  parent: appBarRoute,
  path: 'target/:targetId',
  params: {
    targetId: PathParam(z.coerce.number()),
  },
  search: Params({
    time: z.coerce.number(),
  }),
});
export const fallbackRoute = createRoute({
  parent: rootRoute,
  path: ':any',
  params: {
    any: PathParam(z.string(), { variadic: true, optional: true }),
  },
});
