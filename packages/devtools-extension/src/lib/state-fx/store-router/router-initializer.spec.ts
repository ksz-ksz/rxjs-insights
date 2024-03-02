import { createRouterHarness } from './router';
import { createMemoryHistory, Location } from './history';
import { createRouteFactory } from './route';
import { PathParam } from './path-param';
import { z } from 'zod';
import { createRouteConfig } from './route-config';
import { EMPTY, merge, Observable, of, Subject } from 'rxjs';
import {
  Action,
  actionsComponent,
  ActionType,
  createComponent,
  createContainer,
} from '../store';
import { RouteObject } from './route-object';
import { UrlParamsEncoder } from './url-params-encoder';
import { UrlParamEncoder } from './url-param-encoder';
import { RouteCommand } from './route-command';
import { RouterState } from './router-store';
import { NavigationEvent } from './router-actions';

const createRoute = createRouteFactory({
  searchEncoder: new UrlParamsEncoder(),
  hashEncoder: new UrlParamEncoder(),
});

const parentRoute = createRoute({
  path: 'parent/:parentId',
  params: {
    parentId: PathParam(z.coerce.number()),
  },
});

const childRoute = createRoute({
  parent: parentRoute,
  path: 'child/:childId',
  params: {
    childId: PathParam(z.coerce.number()),
  },
});

function createTestHarness({
  checkParent = () => EMPTY,
  commitParent = () => EMPTY,
  checkChild = () => EMPTY,
  commitChild = () => EMPTY,
}: {
  checkParent?(context: RouteCommand): Observable<Action>;
  commitParent?(context: RouteCommand): Observable<Action>;
  checkChild?(context: RouteCommand): Observable<Action>;
  commitChild?(context: RouteCommand): Observable<Action>;
} = {}) {
  const container = createContainer();
  const actions = container.use(actionsComponent).component;

  const {
    routerActions,
    routerComponent,
    routerInitializerComponent,
    routerStoreComponent,
    routerConfigComponent,
  } = createRouterHarness({
    name: 'router',
    history: createMemoryHistory(),
    searchEncoder: new UrlParamsEncoder(),
    hashEncoder: new UrlParamEncoder(),
  });

  const childRouting = createRouteConfig(childRoute, {
    rules: [
      {
        check: checkChild,
        commit: commitChild,
      },
    ],
  });

  const parentRouting = createRouteConfig(parentRoute, {
    children: [childRouting],
    rules: [
      {
        check: checkParent,
        commit: commitParent,
      },
    ],
  });

  const listen: ActionType<any>[] = [
    routerActions.navigationRequested,
    routerActions.navigationStarted,
    routerActions.navigationChecked,
    routerActions.navigationPrepared,
    routerActions.navigationCompleted,
    routerActions.navigationCancelled,
    routerActions.routeChecked,
    routerActions.routePrepared,
    routerActions.routeCommitted,
  ];
  const listing: Action[] = [];
  merge(...listen.map(actions.ofType, actions)).subscribe((action) => {
    listing.push(action);
  });

  container.provide(
    routerConfigComponent,
    createComponent(() => parentRouting)
  );
  container.use(routerInitializerComponent);
  const router = container.use(routerComponent).component;

  return {
    router,
    actions,
    routerActions,
    listing,
    parentRouting,
    childRouting,
  };
}

function createLocationHarness(
  xs: { id: number; path: string[]; params: any }[]
) {
  const pathname = xs.flatMap((x) => x.path).join('/');
  const location: Location = {
    pathname,
    search: '',
    hash: '',
  };
  const routes: RouteObject[] = [];
  let params = {};
  for (let x of xs) {
    params = { ...params, ...x.params };
    routes.push({
      id: x.id,
      path: x.path,
      params,
      search: undefined,
      hash: undefined,
    });
  }

  return [location, routes] as const;
}

describe('routing', () => {
  it('should emit navigation event', () => {
    const {
      router,
      actions,
      routerActions,
      listing,
      parentRouting,
      childRouting,
    } = createTestHarness();

    const [location, routes] = createLocationHarness([
      {
        id: parentRouting.route.id,
        path: ['parent', '42'],
        params: {
          parentId: 42,
        },
      },
      {
        id: childRouting.route.id,
        path: ['child', '7'],
        params: {
          childId: 7,
        },
      },
    ]);

    actions.dispatch(
      routerActions.navigate({
        location,
        state: null,
      })
    );

    const routerStateBase: RouterState = {
      navigationState: 'idle',
      navigationPhase: undefined,
      location: {
        pathname: '',
        search: '',
        hash: '',
      },
      origin: 'pop',
      state: null,
      key: 'default',
      routes: [],
    };

    const payloadBase: NavigationEvent = {
      location,
      origin: 'push',
      state: null,
      key: '0',
      routerState: routerStateBase,
    };

    expect(listing).toEqual([
      routerActions.navigationRequested(payloadBase),
      routerActions.navigationStarted({
        ...payloadBase,
        routerState: {
          ...routerStateBase,
          navigationState: 'navigating',
          navigationPhase: 'check',
        },
      }),
      // routerActions.routeChecked({
      //   type: "activate-update",
      //   routerState: {
      //     ...routerStateBase
      //   },
      //
      // })
    ]);
  });

  describe('when parent rule resolves with false', () => {
    it('should emit navigation event', () => {
      const resolveParent = () =>
        of(routerActions.cancelNavigation({ reason: 'botak' }));
      const { actions, routerActions, listing, parentRouting, childRouting } =
        createTestHarness({ checkParent: resolveParent });

      actions.dispatch(
        routerActions.navigate({
          location: childRoute({
            params: {
              parentId: 42,
              childId: 7,
            },
          }),
          state: null,
        })
      );

      const activeLocation: Location = {
        pathname: 'parent/42/child/7',
        search: '',
        hash: '',
      };

      const activeParentRoute: RouteObject = {
        id: parentRouting.route.id,
        path: ['parent', '42'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 42,
        },
      };

      const activeChildRoute: RouteObject = {
        id: childRouting.route.id,
        path: ['child', '7'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 42,
          childId: 7,
        },
      };
      expect(listing).toEqual([]);
    });
  });

  describe('when child rule resolves with false', () => {
    it('should emit navigation event', () => {
      const resolveChild = () =>
        of(routerActions.cancelNavigation({ reason: 'botak' }));
      const { actions, routerActions, listing, parentRouting, childRouting } =
        createTestHarness({ checkChild: resolveChild });

      actions.dispatch(
        routerActions.navigate({
          location: childRoute({
            params: {
              parentId: 42,
              childId: 7,
            },
          }),
          state: null,
        })
      );

      const activeLocation: Location = {
        pathname: 'parent/42/child/7',
        search: '',
        hash: '',
      };

      const activeParentRoute: RouteObject = {
        id: parentRouting.route.id,
        path: ['parent', '42'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 42,
        },
      };

      const activeChildRoute: RouteObject = {
        id: childRouting.route.id,
        path: ['child', '7'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 42,
          childId: 7,
        },
      };
      expect(listing).toEqual([]);
    });
  });

  describe('when parent rule resolves with path', () => {
    it('should emit navigation event', () => {
      const resolveParent = (context: RouteCommand) => {
        if (context.activatedLocation.pathname === 'parent/42/child/7') {
          return of(
            routerActions.navigate({
              location: childRoute({
                params: {
                  parentId: 43,
                  childId: 8,
                },
              }),
            })
          );
        } else {
          return EMPTY;
        }
      };
      const { actions, routerActions, listing, parentRouting, childRouting } =
        createTestHarness({ checkParent: resolveParent });

      actions.dispatch(
        routerActions.navigate({
          location: childRoute({
            params: {
              parentId: 42,
              childId: 7,
            },
          }),
          state: null,
        })
      );

      const activeLocation: Location = {
        pathname: 'parent/42/child/7',
        search: '',
        hash: '',
      };

      const activeParentRoute: RouteObject = {
        id: parentRouting.route.id,
        path: ['parent', '42'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 42,
        },
      };

      const activeChildRoute: RouteObject = {
        id: childRouting.route.id,
        path: ['child', '7'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 42,
          childId: 7,
        },
      };

      const redirectedLocation: Location = {
        pathname: 'parent/43/child/8',
        search: '',
        hash: '',
      };

      const redirectedParentRoute: RouteObject = {
        id: parentRouting.route.id,
        path: ['parent', '43'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 43,
        },
      };

      const redirectedChildRoute: RouteObject = {
        id: childRouting.route.id,
        path: ['child', '8'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 43,
          childId: 8,
        },
      };
      expect(listing).toEqual([]);
    });
  });

  describe('when child rule resolves with path', () => {
    it('should emit navigation event', () => {
      const resolveChild = (context: RouteCommand) => {
        if (context.activatedLocation.pathname === 'parent/42/child/7') {
          return of(
            routerActions.navigate({
              location: childRoute({
                params: {
                  parentId: 43,
                  childId: 8,
                },
              }),
            })
          );
        } else {
          return EMPTY;
        }
      };
      const { actions, routerActions, listing, parentRouting, childRouting } =
        createTestHarness({ checkChild: resolveChild });

      actions.dispatch(
        routerActions.navigate({
          location: childRoute({
            params: {
              parentId: 42,
              childId: 7,
            },
          }),
          state: null,
        })
      );

      const activeLocation: Location = {
        pathname: 'parent/42/child/7',
        search: '',
        hash: '',
      };

      const activeParentRoute: RouteObject = {
        id: parentRouting.route.id,
        path: ['parent', '42'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 42,
        },
      };

      const activeChildRoute: RouteObject = {
        id: childRouting.route.id,
        path: ['child', '7'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 42,
          childId: 7,
        },
      };

      const redirectedLocation: Location = {
        pathname: 'parent/43/child/8',
        search: '',
        hash: '',
      };

      const redirectedParentRoute: RouteObject = {
        id: parentRouting.route.id,
        path: ['parent', '43'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 43,
        },
      };

      const redirectedChildRoute: RouteObject = {
        id: childRouting.route.id,
        path: ['child', '8'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 43,
          childId: 8,
        },
      };
      expect(listing).toEqual([]);
    });
  });

  describe('when navigation is overridden', () => {
    it('should emit navigation event', () => {
      let resolveParentSubject: Subject<Location | boolean>;
      const resolveParent = () => (resolveParentSubject = new Subject()) as any;
      const { actions, routerActions, listing, parentRouting, childRouting } =
        createTestHarness({ checkParent: resolveParent });

      actions.dispatch(
        routerActions.navigate({
          location: childRoute({
            params: {
              parentId: 42,
              childId: 7,
            },
          }),
          state: null,
        })
      );

      actions.dispatch(
        routerActions.navigate({
          location: childRoute({
            params: {
              parentId: 43,
              childId: 8,
            },
          }),
          state: null,
        })
      );

      resolveParentSubject!.next(true);
      resolveParentSubject!.complete();

      const activeLocation: Location = {
        pathname: 'parent/42/child/7',
        search: '',
        hash: '',
      };

      const activeParentRoute: RouteObject = {
        id: parentRouting.route.id,
        path: ['parent', '42'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 42,
        },
      };

      const activeChildRoute: RouteObject = {
        id: childRouting.route.id,
        path: ['child', '7'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 42,
          childId: 7,
        },
      };

      const redirectedLocation: Location = {
        pathname: 'parent/43/child/8',
        search: '',
        hash: '',
      };

      const redirectedParentRoute: RouteObject = {
        id: parentRouting.route.id,
        path: ['parent', '43'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 43,
        },
      };

      const redirectedChildRoute: RouteObject = {
        id: childRouting.route.id,
        path: ['child', '8'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 43,
          childId: 8,
        },
      };
      expect(listing).toEqual([]);
    });
  });
});
