import { first } from 'rxjs';
import { createLocationRoute, createRoute } from './route';

const statusRoute = createLocationRoute({
  path: 'status',
});

const wrapperRoute = createRoute({
  path: '',
});

const targetsRoute = createRoute({
  parent: wrapperRoute,
  path: 'targets',
});

const targetsListRoute = createLocationRoute({
  parent: targetsRoute,
  path: '',
});

const targetRoute = createLocationRoute({
  parent: targetsRoute,
  path: ':targetId',
  pathParams: {
    targetId: {
      type: 'number',
    },
  },
  queryParams: {
    time: {
      type: 'number',
      default: 0,
    },
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
