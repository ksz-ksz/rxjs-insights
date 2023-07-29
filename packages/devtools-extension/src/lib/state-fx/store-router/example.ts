import { first } from 'rxjs';
import { createRoute, createRoute } from './route';
import { NumberParam } from './number-param';
import { BooleanParam } from './boolean-param';
import { StringParam } from './string-param';

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
  pathParams: {
    parentParam: BooleanParam({ trueValue: 'yes', falseValue: 'no' }),
  },
});

const route = createRoute({
  parent: parentRoute,
  path: 'asd/:zxc/qwe',
  pathParams: {
    zxc: NumberParam,
  },
  queryParams: {
    asd: StringParam,
  },
});

route({
  pathParams: {
    zxc: 2,
    parentParam: true,
  },
});
