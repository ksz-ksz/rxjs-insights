import { first } from 'rxjs';
import { createRoute, Route } from './route';
import { NumberParam } from './tmp/number-param';
import { Param } from './tmp/param';
import { z } from 'zod';
import { URLEncodedParams } from './tmp/url-encoded-params';
import {
  createSelector,
  createSelectorFunction,
  SelectorContext,
} from '@lib/state-fx/store';

const statusRoute = createRoute({
  path: 'status',
});

const wrapperRoute = createRoute({
  path: '',
});

const targetsRoute = createRoute({
  parent: wrapperRoute,
  path: 'targets',
});

const targetsListRoute = createRoute({
  parent: targetsRoute,
  path: '',
});

const targetRoute = createRoute({
  parent: targetsRoute,
  path: ':targetId',
  pathParams: {
    targetId: NumberParam,
  },
  queryParams: {
    time: NumberParam,
  },
});

const routing = createRouting({
  routes: [
    createRouting({
      route: statusRoute,
      config: {
        component: StatusComponen,
        rules: [
          canLeave((store, route) =>
            store
              .select(instrumentationStatusSelector)
              .pipe(first((value) => value === 'installed'))
          ),
          canEnter((store, route) =>
            store
              .select(instrumentationStatusSelector)
              .pipe(first((value) => value !== 'installed'))
          ),
        ],
      },
    }),
    createRouting({
      config: {
        component: WrapperComponent,
      },
      routes: [
        createRouting({
          route: targetsListRoute,
          config: {
            component: TargetListComponent,
          },
        }),
        createRouting({
          route: targetRoute,
          config: {
            component: TargetComponent,
            rules: [
              resolve((store, route) =>
                store
                  .select(hasTargetStateSelector, [route.pathParams.targetId])
                  .pipe(first(isTruthy))
              ),
            ],
          },
        }),
      ],
    }),
  ],
  fallbackRoute: {},
});

const parentRoute = createRoute({
  path: ':parentParam',
  params: {
    parentParam: Param(z.coerce.boolean()),
  },
});

type X = ExtractAllPathParams<typeof parentRoute>;

const route = createRoute({
  parent: parentRoute,
  path: 'asd/:zxcx/qwe',
  params: {
    zxcx: Param(z.coerce.number()),
    parentParam: Param(z.coerce.number()),
  },
  search: URLEncodedParams({
    asd: Param(z.coerce.string()),
  }),
});

route({
  params: {
    zxcx: 2,
    parentParam: 2,
  },
});

type RouteData<TPathParams, TSearch, THash> = {
  id: number;
  path: string;
  params: TPathParams;
  search?: TSearch;
  hash: THash;
};

interface RouterState {
  location: {
    pathname: string;
    search: string;
    hash: string;
  };
  routes: RouteData<unknown, unknown, unknown>[];
}

interface State {
  router: RouterState;
}

const state: State = undefined as any;

const selectRoute = createSelector(
  <TPathParams, TSearch, THash>(
    context: SelectorContext<State>,
    route: Route<TPathParams, TSearch, THash>
  ): RouteData<TPathParams, TSearch, THash> => {
    return undefined as any;
  }
);

const getRoute = createSelectorFunction(selectRoute);

const rd = getRoute(state, route);

type Z = typeof rd['params'];

type X = string & { asd: number };

rd.params.zxcx;

rd.search?.asd;

const;
