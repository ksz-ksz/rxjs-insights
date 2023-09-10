import { createRouter } from './router';
import { Location, createMemoryHistory } from './history';
import { createRoute } from './route';
import { PathParam } from './path-param';
import { z } from 'zod';
import { createRouting, RoutingRuleContext } from './routing';
import {
  EMPTY,
  ignoreElements,
  NEVER,
  Observable,
  of,
  Subject,
  tap,
} from 'rxjs';
import { Action, createEffect, createStore } from '../store';
import { createRouterReducer } from './router-reducer';
import { createRouterEffect } from './create-router-effect';
import { ActiveRoute } from './active-route';

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

function createTestHarness(
  actions: Observable<Action<any>>,
  {
    resolveParent = () => of(true),
    commitParent = () => EMPTY,
    resolveChild = () => of(true),
    commitChild = () => EMPTY,
  }: {
    resolveParent?(
      context: RoutingRuleContext<any, any, any, any, any>
    ): Observable<Location | boolean>;
    commitParent?(
      context: RoutingRuleContext<any, any, any, any, any>
    ): Observable<void>;
    resolveChild?(
      context: RoutingRuleContext<any, any, any, any, any>
    ): Observable<Location | boolean>;
    commitChild?(
      context: RoutingRuleContext<any, any, any, any, any>
    ): Observable<void>;
  } = {}
) {
  const childRouting = createRouting(childRoute, {
    rules: [
      {
        commit: commitChild,
        resolve: resolveChild,
      },
    ],
  });

  const parentRouting = createRouting(parentRoute, {
    children: [childRouting],
    rules: [
      {
        commit: commitParent,
        resolve: resolveParent,
      },
    ],
  });

  const history = createMemoryHistory();

  const router = createRouter({
    namespace: 'router',
    history,
  });

  router.start(parentRouting);

  const routerReducer = createRouterReducer({
    router,
  });

  const store = createStore({
    reducers: (c) => c.add(routerReducer),
  });

  const routerEffect = createRouterEffect(router);

  const listing: ListingEntry[] = [];
  const listingEffect = createEffect({
    namespace: 'listing',
    effects: {
      listing: (actions) =>
        actions.pipe(
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
    },
  });

  store.registerEffect(listingEffect);
  store.registerEffect(routerEffect);

  actions.subscribe((action) => store.dispatch(action));

  return {
    router,
    listing,
    parentRouting,
    childRouting,
  };
}

describe('createRouterEffect', () => {
  it('should emit navigation event', () => {
    const actions = new Subject<Action<any>>();
    const { router, listing, parentRouting, childRouting } =
      createTestHarness(actions);

    actions.next(
      router.actions.NavigationRequested({
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

    const activeParentRoute: ActiveRoute<any, any, any> = {
      id: parentRouting.id,
      path: ['parent', '42'],
      search: undefined,
      hash: undefined,
      params: {
        parentId: 42,
      },
    };

    const activeChildRoute: ActiveRoute<any, any, any> = {
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
        router.actions.NavigationRequested({
          origin: 'push',
          location: activeLocation,
          state: null,
          key: 'key',
        }),
        router.actions.NavigationStarted({
          origin: 'push',
          location: activeLocation,
          state: null,
          key: 'key',
          routes: [activeParentRoute, activeChildRoute],
        }),
        router.actions.RouteResolved({
          status: 'activated',
          activatedLocation: activeLocation,
          activatedRoute: activeParentRoute,
          activatedRoutes: [activeParentRoute, activeChildRoute],
        }),
        router.actions.RouteResolved({
          status: 'activated',
          activatedLocation: activeLocation,
          activatedRoute: activeChildRoute,
          activatedRoutes: [activeParentRoute, activeChildRoute],
        }),
        router.actions.RouteCommitted({
          status: 'activated',
          activatedLocation: activeLocation,
          activatedRoute: activeParentRoute,
          activatedRoutes: [activeParentRoute, activeChildRoute],
        }),
        router.actions.RouteCommitted({
          status: 'activated',
          activatedLocation: activeLocation,
          activatedRoute: activeChildRoute,
          activatedRoutes: [activeParentRoute, activeChildRoute],
        }),
        router.actions.NavigationCompleted({
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
      const { router, listing, parentRouting, childRouting } =
        createTestHarness(actions, { resolveParent });

      actions.next(
        router.actions.NavigationRequested({
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

      const activeParentRoute: ActiveRoute<any, any, any> = {
        id: parentRouting.id,
        path: ['parent', '42'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 42,
        },
      };

      const activeChildRoute: ActiveRoute<any, any, any> = {
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
          router.actions.NavigationRequested({
            origin: 'push',
            location: activeLocation,
            state: null,
            key: 'key',
          }),
          router.actions.NavigationStarted({
            origin: 'push',
            location: activeLocation,
            state: null,
            key: 'key',
            routes: [activeParentRoute, activeChildRoute],
          }),
          router.actions.NavigationCanceled({
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
      const { router, listing, parentRouting, childRouting } =
        createTestHarness(actions, { resolveChild });

      actions.next(
        router.actions.NavigationRequested({
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

      const activeParentRoute: ActiveRoute<any, any, any> = {
        id: parentRouting.id,
        path: ['parent', '42'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 42,
        },
      };

      const activeChildRoute: ActiveRoute<any, any, any> = {
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
          router.actions.NavigationRequested({
            origin: 'push',
            location: activeLocation,
            state: null,
            key: 'key',
          }),
          router.actions.NavigationStarted({
            origin: 'push',
            location: activeLocation,
            state: null,
            key: 'key',
            routes: [activeParentRoute, activeChildRoute],
          }),
          router.actions.NavigationCanceled({
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
      const resolveParent = (
        context: RoutingRuleContext<any, any, any, any, any>
      ) => {
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
      const { router, listing, parentRouting, childRouting } =
        createTestHarness(actions, { resolveParent });

      actions.next(
        router.actions.NavigationRequested({
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

      const activeParentRoute: ActiveRoute<any, any, any> = {
        id: parentRouting.id,
        path: ['parent', '42'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 42,
        },
      };

      const activeChildRoute: ActiveRoute<any, any, any> = {
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

      const redirectedParentRoute: ActiveRoute<any, any, any> = {
        id: parentRouting.id,
        path: ['parent', '43'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 43,
        },
      };

      const redirectedChildRoute: ActiveRoute<any, any, any> = {
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
          router.actions.NavigationRequested({
            origin: 'push',
            location: activeLocation,
            state: null,
            key: 'key',
          }),
          router.actions.NavigationStarted({
            origin: 'push',
            location: activeLocation,
            state: null,
            key: 'key',
            routes: [activeParentRoute, activeChildRoute],
          }),
          router.actions.NavigationCanceled({
            reason: 'redirected',
            origin: 'push',
            location: activeLocation,
            state: null,
            key: 'key',
            routes: [activeParentRoute, activeChildRoute],
          }),
          router.actions.NavigationRequested({
            origin: 'push',
            location: redirectedLocation,
            state: null,
            key: 'key',
          }),
          router.actions.NavigationStarted({
            origin: 'push',
            location: redirectedLocation,
            state: null,
            key: 'key',
            routes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.RouteResolved({
            status: 'activated',
            activatedLocation: redirectedLocation,
            activatedRoute: redirectedParentRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.RouteResolved({
            status: 'activated',
            activatedLocation: redirectedLocation,
            activatedRoute: redirectedChildRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.RouteCommitted({
            status: 'activated',
            activatedLocation: redirectedLocation,
            activatedRoute: redirectedParentRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.RouteCommitted({
            status: 'activated',
            activatedLocation: redirectedLocation,
            activatedRoute: redirectedChildRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.NavigationCompleted({
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
      const resolveChild = (
        context: RoutingRuleContext<any, any, any, any, any>
      ) => {
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
      const { router, listing, parentRouting, childRouting } =
        createTestHarness(actions, { resolveChild });

      actions.next(
        router.actions.NavigationRequested({
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

      const activeParentRoute: ActiveRoute<any, any, any> = {
        id: parentRouting.id,
        path: ['parent', '42'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 42,
        },
      };

      const activeChildRoute: ActiveRoute<any, any, any> = {
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

      const redirectedParentRoute: ActiveRoute<any, any, any> = {
        id: parentRouting.id,
        path: ['parent', '43'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 43,
        },
      };

      const redirectedChildRoute: ActiveRoute<any, any, any> = {
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
          router.actions.NavigationRequested({
            location: activeLocation,
            state: null,
            key: 'key',
            origin: 'push',
          }),
          router.actions.NavigationStarted({
            origin: 'push',
            location: activeLocation,
            state: null,
            key: 'key',
            routes: [activeParentRoute, activeChildRoute],
          }),
          router.actions.NavigationCanceled({
            reason: 'redirected',
            origin: 'push',
            location: activeLocation,
            state: null,
            key: 'key',
            routes: [activeParentRoute, activeChildRoute],
          }),
          router.actions.NavigationRequested({
            location: redirectedLocation,
            state: null,
            key: 'key',
            origin: 'push',
          }),
          router.actions.NavigationStarted({
            origin: 'push',
            location: redirectedLocation,
            state: null,
            key: 'key',
            routes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.RouteResolved({
            status: 'activated',
            activatedLocation: redirectedLocation,
            activatedRoute: redirectedParentRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.RouteResolved({
            status: 'activated',
            activatedLocation: redirectedLocation,
            activatedRoute: redirectedChildRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.RouteCommitted({
            status: 'activated',
            activatedLocation: redirectedLocation,
            activatedRoute: redirectedParentRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.RouteCommitted({
            status: 'activated',
            activatedLocation: redirectedLocation,
            activatedRoute: redirectedChildRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.NavigationCompleted({
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
      const { router, listing, parentRouting, childRouting } =
        createTestHarness(actions, { resolveParent });

      actions.next(
        router.actions.NavigationRequested({
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
        router.actions.NavigationRequested({
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

      const activeParentRoute: ActiveRoute<any, any, any> = {
        id: parentRouting.id,
        path: ['parent', '42'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 42,
        },
      };

      const activeChildRoute: ActiveRoute<any, any, any> = {
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

      const redirectedParentRoute: ActiveRoute<any, any, any> = {
        id: parentRouting.id,
        path: ['parent', '43'],
        search: undefined,
        hash: undefined,
        params: {
          parentId: 43,
        },
      };

      const redirectedChildRoute: ActiveRoute<any, any, any> = {
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
          router.actions.NavigationRequested({
            location: activeLocation,
            state: null,
            key: 'key',
            origin: 'push',
          }),
          router.actions.NavigationStarted({
            origin: 'push',
            location: activeLocation,
            state: null,
            key: 'key',
            routes: [activeParentRoute, activeChildRoute],
          }),
          router.actions.NavigationRequested({
            location: redirectedLocation,
            state: null,
            key: 'key',
            origin: 'push',
          }),
          router.actions.NavigationCanceled({
            reason: 'overridden',
            origin: 'push',
            location: activeLocation,
            state: null,
            key: 'key',
            routes: [activeParentRoute, activeChildRoute],
          }),
          router.actions.NavigationStarted({
            origin: 'push',
            location: redirectedLocation,
            state: null,
            key: 'key',
            routes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.RouteResolved({
            status: 'activated',
            activatedLocation: redirectedLocation,
            activatedRoute: redirectedParentRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.RouteResolved({
            status: 'activated',
            activatedLocation: redirectedLocation,
            activatedRoute: redirectedChildRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.RouteCommitted({
            status: 'activated',
            activatedLocation: redirectedLocation,
            activatedRoute: redirectedParentRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.RouteCommitted({
            status: 'activated',
            activatedLocation: redirectedLocation,
            activatedRoute: redirectedChildRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.NavigationCompleted({
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
