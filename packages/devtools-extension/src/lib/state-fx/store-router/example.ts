import { createRoute } from './route';
import { Param } from './param';
import { z } from 'zod';
import browserHistory from 'history/browser';
import { createStore } from '@lib/state-fx/store';
import { createRouting } from './routing';
import { Path } from 'history';
import { Observable, of } from 'rxjs';
import { createRouter } from './router';
import { createRouterReducer } from './router-reducer';
import { startRouter } from './start-router';
import { PathParam } from './path-param';

const rootRoute = createRoute({
  path: '',
});

const featureRoute = createRoute({
  parent: rootRoute,
  path: 'feature/:id',
  params: {
    id: PathParam(z.coerce.number(), { variadic: true }),
  },
});

const [routerReducer, routerActions, routerSelectors] = createRouterReducer({
  namespace: 'router',
});

const router = createRouter<{ component: unknown }>();

const store = createStore({
  reducers: (composer) => composer.add(routerReducer),
});

let routing = createRouting({
  route: rootRoute,
  config: {
    component: RootComponent,
  },
  children: [
    createRouting({
      route: featureRoute,
      config: {
        component: FeatureComponent,
      },
      rules: [
        {
          interceptEnter(context): Observable<Path | boolean> {
            return of(context.route.params.id !== 0);
          },
        },
      ],
    }),
  ],
});

startRouter({
  store,
  router,
  routing,
  history: browserHistory,
});
