import { createRouter } from './router';
import { Location, createMemoryHistory } from './history';
import { createRoute } from './route';
import { PathParam } from './path-param';
import { z } from 'zod';
import {
  createRouteConfig,
  RoutingRule,
  RoutingRuleContext,
} from './route-config';
import {
  EMPTY,
  ignoreElements,
  merge,
  NEVER,
  Observable,
  of,
  Subject,
  tap,
} from 'rxjs';
import {
  Action,
  actionsComponent,
  Component,
  Container,
  createActions,
  createContainer,
  createEffect,
  createStore,
  InitializedComponent,
} from '../store';
import { createRouterStore } from './router-store';
import { createRouterEffect } from './create-router-effect';
import { RouteObject } from './route-object';
import { RouterActions } from './router-actions';
import { createRouting } from './routing';

type ListingEntry = ['N', Action<any>] | ['E', any] | ['C'];

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

function createRuleComponent(
  rule: RoutingRule<any>
): Component<RoutingRule<any>> {
  return {
    init(): InitializedComponent<RoutingRule<any>> {
      return {
        component: rule,
      };
    },
  };
}

function createTestHarness(
  actions: Observable<Action<any>>,
  {
    checkParent = () => of(true),
    commitParent = () => EMPTY,
    checkChild = () => of(true),
    commitChild = () => EMPTY,
  }: {
    checkParent?(
      context: RoutingRuleContext<any>
    ): Observable<Location | boolean>;
    commitParent?(context: RoutingRuleContext<any>): Observable<void>;
    checkChild?(
      context: RoutingRuleContext<any>
    ): Observable<Location | boolean>;
    commitChild?(context: RoutingRuleContext<any>): Observable<void>;
  } = {}
) {
  const childRouting = createRouteConfig(childRoute, {
    rules: [
      createRuleComponent({
        check: checkChild,
        commit: commitChild,
      }),
    ],
  });

  const parentRouting = createRouteConfig(parentRoute, {
    children: [childRouting],
    rules: [
      createRuleComponent({
        check: checkParent,
        commit: commitParent,
      }),
    ],
  });

  const history = createMemoryHistory();

  const router = createRouter({
    history,
  });

  const routerActions = createActions<RouterActions>({ namespace: 'router' });

  const routerStore = createRouterStore({
    namespace: 'router',
    actions: routerActions,
  });

  const routing = createRouting({
    router,
    routerActions,
    routerStore,
    routerConfig: parentRouting,
  });

  const listing: ListingEntry[] = [];
  const listingEffect = createEffect({
    namespace: 'listing',
  })({
    listing: (actions) =>
      merge(
        actions.ofType(routerActions.Navigate),
        actions.ofType(routerActions.NavigationRequested),
        actions.ofType(routerActions.NavigationStarted),
        actions.ofType(routerActions.NavigationCompleted),
        actions.ofType(routerActions.NavigationCanceled),
        actions.ofType(routerActions.RouteResolved),
        actions.ofType(routerActions.RouteCommitted)
      ).pipe(
        tap({
          next(x) {
            listing.push(['N', x]);
          },
          error(x) {
            listing.push(['E', x]);
          },
          complete() {
            listing.push(['C']);
          },
        }),
        ignoreElements()
      ),
  });

  const container = createContainer();

  const actionsRef = container.use(actionsComponent);
  container.use(listingEffect);
  container.use(routing);

  actions.subscribe((action) => actionsRef.component.dispatch(action));

  return {
    routerActions,
    listing,
    parentRouting,
    childRouting,
  };
}

describe('createRouterEffect', () => {
  it('should emit navigation event', () => {
    const actions = new Subject<Action<any>>();
    const { routerActions, listing, parentRouting, childRouting } =
      createTestHarness(actions);

    actions.next(
      routerActions.NavigationRequested({
        location: childRoute({
          params: {
            parentId: 42,
            childId: 7,
          },
        }),
        state: null,
        key: 'key',
        origin: 'push',
      })
    );

    const activeLocation: Location = {
      pathname: 'parent/42/child/7',
      search: '',
      hash: '',
    };

    const activeParentRoute: RouteObject = {
      id: parentRouting.id,
      path: ['parent', '42'],
      search: undefined,
      hash: undefined,
      params: {
        parentId: 42,
      },
    };

    const activeChildRoute: RouteObject = {
      id: childRouting.id,
      path: ['child', '7'],
      search: undefined,
      hash: undefined,
      params: {
        parentId: 42,
        childId: 7,
      },
    };
    expect(listing).toEqual(
      [
        routerActions.NavigationRequested({
          origin: 'push',
          location: activeLocation,
          state: null,
          key: 'key',
        }),
        routerActions.NavigationStarted({
          origin: 'push',
          location: activeLocation,
          state: null,
          key: 'key',
          routes: [activeParentRoute, activeChildRoute],
        }),
        routerActions.RouteResolved({
          status: 'activated',
          activatedLocation: activeLocation,
          activatedRoute: activeParentRoute,
          activatedRoutes: [activeParentRoute, activeChildRoute],
        }),
        routerActions.RouteResolved({
          status: 'activated',
          activatedLocation: activeLocation,
          activatedRoute: activeChildRoute,
          activatedRoutes: [activeParentRoute, activeChildRoute],
        }),
        routerActions.RouteCommitted({
          status: 'activated',
          activatedLocation: activeLocation,
          activatedRoute: activeParentRoute,
          activatedRoutes: [activeParentRoute, activeChildRoute],
        }),
        routerActions.RouteCommitted({
          status: 'activated',
          activatedLocation: activeLocation,
          activatedRoute: activeChildRoute,
          activatedRoutes: [activeParentRoute, activeChildRoute],
        }),
        routerActions.NavigationCompleted({
          origin: 'push',
          location: activeLocation,
          state: null,
          key: 'key',
          routes: [activeParentRoute, activeChildRoute],
        }),
      ].map((action): ListingEntry => ['N', action])
    );
  });

  describe('when parent rule resolves with false', () => {
    it('should emit navigation event', () => {
      const actions = new Subject<Action<any>>();
      const resolveParent = () => of(false);
      const { routerActions, listing, parentRouting, childRouting } =
        createTestHarness(actions, { checkParent: resolveParent });

      actions.next(
        routerActions.NavigationRequested({
          location: childRoute({
            params: {
              parentId: 42,
              childId: 7,
            },
          }),
          state: null,
          key: 'key',
          origin: 'push',
        })
      );

      const activeLocation: Location = {
        pathname: 'parent/42/child/7',
        search: '',
        hash: '',
      };

      const activeParentRoute: RouteObject = {
        id: parentRouting.id,
        path: ['parent', '42'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 42,
        },
      };

      const activeChildRoute: RouteObject = {
        id: childRouting.id,
        path: ['child', '7'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 42,
          childId: 7,
        },
      };
      expect(listing).toEqual(
        [
          routerActions.NavigationRequested({
            origin: 'push',
            location: activeLocation,
            state: null,
            key: 'key',
          }),
          routerActions.NavigationStarted({
            origin: 'push',
            location: activeLocation,
            state: null,
            key: 'key',
            routes: [activeParentRoute, activeChildRoute],
          }),
          routerActions.NavigationCanceled({
            reason: 'intercepted',
            origin: 'push',
            location: activeLocation,
            state: null,
            key: 'key',
            routes: [activeParentRoute, activeChildRoute],
          }),
        ].map((action): ListingEntry => ['N', action])
      );
    });
  });

  describe('when child rule resolves with false', () => {
    it('should emit navigation event', () => {
      const actions = new Subject<Action<any>>();
      const resolveChild = () => of(false);
      const { routerActions, listing, parentRouting, childRouting } =
        createTestHarness(actions, { checkChild: resolveChild });

      actions.next(
        routerActions.NavigationRequested({
          location: childRoute({
            params: {
              parentId: 42,
              childId: 7,
            },
          }),
          state: null,
          key: 'key',
          origin: 'push',
        })
      );

      const activeLocation: Location = {
        pathname: 'parent/42/child/7',
        search: '',
        hash: '',
      };

      const activeParentRoute: RouteObject = {
        id: parentRouting.id,
        path: ['parent', '42'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 42,
        },
      };

      const activeChildRoute: RouteObject = {
        id: childRouting.id,
        path: ['child', '7'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 42,
          childId: 7,
        },
      };
      expect(listing).toEqual(
        [
          routerActions.NavigationRequested({
            origin: 'push',
            location: activeLocation,
            state: null,
            key: 'key',
          }),
          routerActions.NavigationStarted({
            origin: 'push',
            location: activeLocation,
            state: null,
            key: 'key',
            routes: [activeParentRoute, activeChildRoute],
          }),
          routerActions.NavigationCanceled({
            reason: 'intercepted',
            origin: 'push',
            location: activeLocation,
            state: null,
            key: 'key',
            routes: [activeParentRoute, activeChildRoute],
          }),
        ].map((action): ListingEntry => ['N', action])
      );
    });
  });

  describe('when parent rule resolves with path', () => {
    it('should emit navigation event', () => {
      const actions = new Subject<Action<any>>();
      const resolveParent = (context: RoutingRuleContext<any>) => {
        if (context.location.pathname === 'parent/42/child/7') {
          return of(
            childRoute({
              params: {
                parentId: 43,
                childId: 8,
              },
            })
          );
        } else {
          return of(true);
        }
      };
      const { routerActions, listing, parentRouting, childRouting } =
        createTestHarness(actions, { checkParent: resolveParent });

      actions.next(
        routerActions.NavigationRequested({
          location: childRoute({
            params: {
              parentId: 42,
              childId: 7,
            },
          }),
          state: null,
          key: 'key',
          origin: 'push',
        })
      );

      const activeLocation: Location = {
        pathname: 'parent/42/child/7',
        search: '',
        hash: '',
      };

      const activeParentRoute: RouteObject = {
        id: parentRouting.id,
        path: ['parent', '42'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 42,
        },
      };

      const activeChildRoute: RouteObject = {
        id: childRouting.id,
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
        id: parentRouting.id,
        path: ['parent', '43'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 43,
        },
      };

      const redirectedChildRoute: RouteObject = {
        id: childRouting.id,
        path: ['child', '8'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 43,
          childId: 8,
        },
      };
      expect(listing).toEqual(
        [
          routerActions.NavigationRequested({
            origin: 'push',
            location: activeLocation,
            state: null,
            key: 'key',
          }),
          routerActions.NavigationStarted({
            origin: 'push',
            location: activeLocation,
            state: null,
            key: 'key',
            routes: [activeParentRoute, activeChildRoute],
          }),
          routerActions.NavigationCanceled({
            reason: 'redirected',
            origin: 'push',
            location: activeLocation,
            state: null,
            key: 'key',
            routes: [activeParentRoute, activeChildRoute],
          }),
          routerActions.NavigationRequested({
            origin: 'push',
            location: redirectedLocation,
            state: null,
            key: 'key',
          }),
          routerActions.NavigationStarted({
            origin: 'push',
            location: redirectedLocation,
            state: null,
            key: 'key',
            routes: [redirectedParentRoute, redirectedChildRoute],
          }),
          routerActions.RouteResolved({
            status: 'activated',
            activatedLocation: redirectedLocation,
            activatedRoute: redirectedParentRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          routerActions.RouteResolved({
            status: 'activated',
            activatedLocation: redirectedLocation,
            activatedRoute: redirectedChildRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          routerActions.RouteCommitted({
            status: 'activated',
            activatedLocation: redirectedLocation,
            activatedRoute: redirectedParentRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          routerActions.RouteCommitted({
            status: 'activated',
            activatedLocation: redirectedLocation,
            activatedRoute: redirectedChildRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          routerActions.NavigationCompleted({
            origin: 'push',
            location: redirectedLocation,
            state: null,
            key: 'key',
            routes: [redirectedParentRoute, redirectedChildRoute],
          }),
        ].map((action): ListingEntry => ['N', action])
      );
    });
  });

  describe('when child rule resolves with path', () => {
    it('should emit navigation event', () => {
      const actions = new Subject<Action<any>>();
      const resolveChild = (context: RoutingRuleContext<any>) => {
        if (context.location.pathname === 'parent/42/child/7') {
          return of(
            childRoute({
              params: {
                parentId: 43,
                childId: 8,
              },
            })
          );
        } else {
          return of(true);
        }
      };
      const { routerActions, listing, parentRouting, childRouting } =
        createTestHarness(actions, { checkChild: resolveChild });

      actions.next(
        routerActions.NavigationRequested({
          location: childRoute({
            params: {
              parentId: 42,
              childId: 7,
            },
          }),
          state: null,
          key: 'key',
          origin: 'push',
        })
      );

      const activeLocation: Location = {
        pathname: 'parent/42/child/7',
        search: '',
        hash: '',
      };

      const activeParentRoute: RouteObject = {
        id: parentRouting.id,
        path: ['parent', '42'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 42,
        },
      };

      const activeChildRoute: RouteObject = {
        id: childRouting.id,
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
        id: parentRouting.id,
        path: ['parent', '43'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 43,
        },
      };

      const redirectedChildRoute: RouteObject = {
        id: childRouting.id,
        path: ['child', '8'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 43,
          childId: 8,
        },
      };
      expect(listing).toEqual(
        [
          routerActions.NavigationRequested({
            location: activeLocation,
            state: null,
            key: 'key',
            origin: 'push',
          }),
          routerActions.NavigationStarted({
            origin: 'push',
            location: activeLocation,
            state: null,
            key: 'key',
            routes: [activeParentRoute, activeChildRoute],
          }),
          routerActions.NavigationCanceled({
            reason: 'redirected',
            origin: 'push',
            location: activeLocation,
            state: null,
            key: 'key',
            routes: [activeParentRoute, activeChildRoute],
          }),
          routerActions.NavigationRequested({
            location: redirectedLocation,
            state: null,
            key: 'key',
            origin: 'push',
          }),
          routerActions.NavigationStarted({
            origin: 'push',
            location: redirectedLocation,
            state: null,
            key: 'key',
            routes: [redirectedParentRoute, redirectedChildRoute],
          }),
          routerActions.RouteResolved({
            status: 'activated',
            activatedLocation: redirectedLocation,
            activatedRoute: redirectedParentRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          routerActions.RouteResolved({
            status: 'activated',
            activatedLocation: redirectedLocation,
            activatedRoute: redirectedChildRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          routerActions.RouteCommitted({
            status: 'activated',
            activatedLocation: redirectedLocation,
            activatedRoute: redirectedParentRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          routerActions.RouteCommitted({
            status: 'activated',
            activatedLocation: redirectedLocation,
            activatedRoute: redirectedChildRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          routerActions.NavigationCompleted({
            origin: 'push',
            location: redirectedLocation,
            state: null,
            key: 'key',
            routes: [redirectedParentRoute, redirectedChildRoute],
          }),
        ].map((action): ListingEntry => ['N', action])
      );
    });
  });

  describe('when navigation is overridden', () => {
    it('should emit navigation event', () => {
      const actions = new Subject<Action<any>>();
      let resolveParentSubject: Subject<Location | boolean>;
      const resolveParent = () => (resolveParentSubject = new Subject());
      const { routerActions, listing, parentRouting, childRouting } =
        createTestHarness(actions, { checkParent: resolveParent });

      actions.next(
        routerActions.NavigationRequested({
          location: childRoute({
            params: {
              parentId: 42,
              childId: 7,
            },
          }),
          state: null,
          key: 'key',
          origin: 'push',
        })
      );

      actions.next(
        routerActions.NavigationRequested({
          location: childRoute({
            params: {
              parentId: 43,
              childId: 8,
            },
          }),
          state: null,
          key: 'key',
          origin: 'push',
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
        id: parentRouting.id,
        path: ['parent', '42'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 42,
        },
      };

      const activeChildRoute: RouteObject = {
        id: childRouting.id,
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
        id: parentRouting.id,
        path: ['parent', '43'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 43,
        },
      };

      const redirectedChildRoute: RouteObject = {
        id: childRouting.id,
        path: ['child', '8'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 43,
          childId: 8,
        },
      };
      expect(listing).toEqual(
        [
          routerActions.NavigationRequested({
            location: activeLocation,
            state: null,
            key: 'key',
            origin: 'push',
          }),
          routerActions.NavigationStarted({
            origin: 'push',
            location: activeLocation,
            state: null,
            key: 'key',
            routes: [activeParentRoute, activeChildRoute],
          }),
          routerActions.NavigationRequested({
            location: redirectedLocation,
            state: null,
            key: 'key',
            origin: 'push',
          }),
          routerActions.NavigationCanceled({
            reason: 'overridden',
            origin: 'push',
            location: activeLocation,
            state: null,
            key: 'key',
            routes: [activeParentRoute, activeChildRoute],
          }),
          routerActions.NavigationStarted({
            origin: 'push',
            location: redirectedLocation,
            state: null,
            key: 'key',
            routes: [redirectedParentRoute, redirectedChildRoute],
          }),
          routerActions.RouteResolved({
            status: 'activated',
            activatedLocation: redirectedLocation,
            activatedRoute: redirectedParentRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          routerActions.RouteResolved({
            status: 'activated',
            activatedLocation: redirectedLocation,
            activatedRoute: redirectedChildRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          routerActions.RouteCommitted({
            status: 'activated',
            activatedLocation: redirectedLocation,
            activatedRoute: redirectedParentRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          routerActions.RouteCommitted({
            status: 'activated',
            activatedLocation: redirectedLocation,
            activatedRoute: redirectedChildRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          routerActions.NavigationCompleted({
            origin: 'push',
            location: redirectedLocation,
            state: null,
            key: 'key',
            routes: [redirectedParentRoute, redirectedChildRoute],
          }),
        ].map((action): ListingEntry => ['N', action])
      );
    });
  });
});
