import { createRouter } from './router';
import { createMemoryHistory, Path } from 'history';
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
import {
  createNavigateObservable,
  createRouterEffect,
} from './create-router-effect';
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
    ): Observable<Path | boolean>;
    commitParent?(
      context: RoutingRuleContext<any, any, any, any, any>
    ): Observable<void>;
    resolveChild?(
      context: RoutingRuleContext<any, any, any, any, any>
    ): Observable<Path | boolean>;
    commitChild?(
      context: RoutingRuleContext<any, any, any, any, any>
    ): Observable<void>;
  } = {}
) {
  const childRouting = createRouting({
    route: childRoute,
    rules: [
      {
        commit: commitChild,
        resolve: resolveChild,
      },
    ],
  });

  const parentRouting = createRouting({
    route: parentRoute,
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

  const [routerReducer] = createRouterReducer({
    namespace: 'router',
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
      router.actions.Navigate({
        path: childRoute({
          params: {
            parentId: 42,
            childId: 7,
          },
        }),
      })
    );

    const activePath: Path = {
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
        router.actions.Navigate({
          path: activePath,
        }),
        router.actions.NavigationStarted({
          path: activePath,
          routes: [activeParentRoute, activeChildRoute],
        }),
        router.actions.RouteResolved({
          status: 'activated',
          activatedPath: activePath,
          activatedRoute: activeParentRoute,
          activatedRoutes: [activeParentRoute, activeChildRoute],
        }),
        router.actions.RouteResolved({
          status: 'activated',
          activatedPath: activePath,
          activatedRoute: activeChildRoute,
          activatedRoutes: [activeParentRoute, activeChildRoute],
        }),
        router.actions.RouteCommitted({
          status: 'activated',
          activatedPath: activePath,
          activatedRoute: activeParentRoute,
          activatedRoutes: [activeParentRoute, activeChildRoute],
        }),
        router.actions.RouteCommitted({
          status: 'activated',
          activatedPath: activePath,
          activatedRoute: activeChildRoute,
          activatedRoutes: [activeParentRoute, activeChildRoute],
        }),
        router.actions.NavigationCompleted({
          path: activePath,
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
        router.actions.Navigate({
          path: childRoute({
            params: {
              parentId: 42,
              childId: 7,
            },
          }),
        })
      );

      const activePath: Path = {
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
          router.actions.Navigate({
            path: activePath,
          }),
          router.actions.NavigationStarted({
            path: activePath,
            routes: [activeParentRoute, activeChildRoute],
          }),
          router.actions.NavigationCanceled({
            reason: 'intercepted',
            path: activePath,
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
        router.actions.Navigate({
          path: childRoute({
            params: {
              parentId: 42,
              childId: 7,
            },
          }),
        })
      );

      const activePath: Path = {
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
          router.actions.Navigate({
            path: activePath,
          }),
          router.actions.NavigationStarted({
            path: activePath,
            routes: [activeParentRoute, activeChildRoute],
          }),
          router.actions.NavigationCanceled({
            reason: 'intercepted',
            path: activePath,
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
        if (context.path.pathname === 'parent/42/child/7') {
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
        router.actions.Navigate({
          path: childRoute({
            params: {
              parentId: 42,
              childId: 7,
            },
          }),
        })
      );

      const activePath: Path = {
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

      const redirectedPath: Path = {
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
          router.actions.Navigate({
            path: activePath,
          }),
          router.actions.NavigationStarted({
            path: activePath,
            routes: [activeParentRoute, activeChildRoute],
          }),
          router.actions.NavigationCanceled({
            reason: 'redirected',
            path: activePath,
            routes: [activeParentRoute, activeChildRoute],
          }),
          router.actions.Navigate({
            path: redirectedPath,
          }),
          router.actions.NavigationStarted({
            path: redirectedPath,
            routes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.RouteResolved({
            status: 'activated',
            activatedPath: redirectedPath,
            activatedRoute: redirectedParentRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.RouteResolved({
            status: 'activated',
            activatedPath: redirectedPath,
            activatedRoute: redirectedChildRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.RouteCommitted({
            status: 'activated',
            activatedPath: redirectedPath,
            activatedRoute: redirectedParentRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.RouteCommitted({
            status: 'activated',
            activatedPath: redirectedPath,
            activatedRoute: redirectedChildRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.NavigationCompleted({
            path: redirectedPath,
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
        if (context.path.pathname === 'parent/42/child/7') {
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
        router.actions.Navigate({
          path: childRoute({
            params: {
              parentId: 42,
              childId: 7,
            },
          }),
        })
      );

      const activePath: Path = {
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

      const redirectedPath: Path = {
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
          router.actions.Navigate({
            path: activePath,
          }),
          router.actions.NavigationStarted({
            path: activePath,
            routes: [activeParentRoute, activeChildRoute],
          }),
          router.actions.NavigationCanceled({
            reason: 'redirected',
            path: activePath,
            routes: [activeParentRoute, activeChildRoute],
          }),
          router.actions.Navigate({
            path: redirectedPath,
          }),
          router.actions.NavigationStarted({
            path: redirectedPath,
            routes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.RouteResolved({
            status: 'activated',
            activatedPath: redirectedPath,
            activatedRoute: redirectedParentRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.RouteResolved({
            status: 'activated',
            activatedPath: redirectedPath,
            activatedRoute: redirectedChildRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.RouteCommitted({
            status: 'activated',
            activatedPath: redirectedPath,
            activatedRoute: redirectedParentRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.RouteCommitted({
            status: 'activated',
            activatedPath: redirectedPath,
            activatedRoute: redirectedChildRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.NavigationCompleted({
            path: redirectedPath,
            routes: [redirectedParentRoute, redirectedChildRoute],
          }),
        ].map((action): ListingEntry => ['N', action])
      );
    });
  });

  describe('when navigation is overridden', () => {
    it('should emit navigation event', () => {
      const actions = new Subject<Action<any>>();
      let resolveParentSubject: Subject<Path | boolean>;
      const resolveParent = () => (resolveParentSubject = new Subject());
      const { router, listing, parentRouting, childRouting } =
        createTestHarness(actions, { resolveParent });

      actions.next(
        router.actions.Navigate({
          path: childRoute({
            params: {
              parentId: 42,
              childId: 7,
            },
          }),
        })
      );

      actions.next(
        router.actions.Navigate({
          path: childRoute({
            params: {
              parentId: 43,
              childId: 8,
            },
          }),
        })
      );

      resolveParentSubject!.next(true);
      resolveParentSubject!.complete();

      const activePath: Path = {
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

      const redirectedPath: Path = {
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
          router.actions.Navigate({
            path: activePath,
          }),
          router.actions.NavigationStarted({
            path: activePath,
            routes: [activeParentRoute, activeChildRoute],
          }),
          router.actions.Navigate({
            path: redirectedPath,
          }),
          router.actions.NavigationCanceled({
            reason: 'overridden',
            path: activePath,
            routes: [activeParentRoute, activeChildRoute],
          }),
          router.actions.NavigationStarted({
            path: redirectedPath,
            routes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.RouteResolved({
            status: 'activated',
            activatedPath: redirectedPath,
            activatedRoute: redirectedParentRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.RouteResolved({
            status: 'activated',
            activatedPath: redirectedPath,
            activatedRoute: redirectedChildRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.RouteCommitted({
            status: 'activated',
            activatedPath: redirectedPath,
            activatedRoute: redirectedParentRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.RouteCommitted({
            status: 'activated',
            activatedPath: redirectedPath,
            activatedRoute: redirectedChildRoute,
            activatedRoutes: [redirectedParentRoute, redirectedChildRoute],
          }),
          router.actions.NavigationCompleted({
            path: redirectedPath,
            routes: [redirectedParentRoute, redirectedChildRoute],
          }),
        ].map((action): ListingEntry => ['N', action])
      );
    });
  });
});
