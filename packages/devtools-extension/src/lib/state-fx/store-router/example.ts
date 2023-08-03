import { first } from 'rxjs';
import { createRoute, createRoute } from './route';
import { NumberParam } from './tmp/number-param';
import { BooleanParam } from './tmp/boolean-param';
import { StringParam } from './tmp/string-param';
import { Param } from './param';
import { z } from 'zod';
import { URLEncodedParams } from './url-encoded-params';

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

const fallbackRoute = createRoute({
  path: '*',
});

// opt 1

const routes = [
  createRouteConfig({
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
  createRouteConfig({
    route: wrapperRoute,
    config: {
      component: WrapperComponent,
    },
  }),
  createRouteConfig({
    route: targetsListRoute,
    config: {
      component: TargetListComponent,
    },
  }),
  createRouteConfig({
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
];

// opt 2

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

const route = createRoute({
  parent: parentRoute,
  path: 'asd/:zxc/qwe',
  params: {
    zxc: Param(z.coerce.number()),
  },
  search: URLEncodedParams({
    asd: Param(z.coerce.string()),
  }),
});

route({
  params: {
    zxc: 2,
    parentParam: true,
  },
});

interface RouterState {
  location: {
    pathname: string;
    search: string;
    hash: string;
  };
  routes: {
    id: number;
    path: string;
    params: PathParams<string>;
    search: unknown;
    hash: unknown;
  }[];
}
