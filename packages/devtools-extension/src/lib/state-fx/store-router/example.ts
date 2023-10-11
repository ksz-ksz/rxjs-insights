import { createRouteConfig } from './route-config';
import { createRoute } from './route';
import { createBrowserHistory } from './history';
import { createRouter } from './router';
import { Container } from '@lib/state-fx/store';
import { createRouterStore } from './router-store';

const rootRoute = createRoute({ path: '' });

const childRoute = createRoute({ parent: rootRoute, path: 'child' });

const routing = createRouteConfig(rootRoute, {
  children: [createRouteConfig(childRoute)],
});

const routerActions = createRouterActions({ namespace: 'router' });

const routerStore = createRouterStore({
  namespace: 'router',
  actions: routerActions,
});

const router = createRouter({
  history: createBrowserHistory(),
  actions: routerActions,
  store: routerStore,
});

container.use(router).start(routing);

function createRouterComponent() {
  return {
    init(container: Container) {},
  };
}
