import { createRouterHarness } from './router';
import { createMemoryHistory, Location } from './history';
import { createRouteFactory } from './route';
import { PathParam } from './path-param';
import { z } from 'zod';
import {
  createRouteConfig,
  RoutingRule,
  RoutingRuleEvent,
} from './route-config';
import {
  EMPTY,
  ignoreElements,
  merge,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import {
  Action,
  actionsComponent,
  Component,
  ComponentInstance,
  createActions,
  createComponent,
  createContainer,
  createEffectComponent,
} from '../store';
import { createRouterStoreComponent } from './router-store';
import { RouteObject } from './route-object';
import { RouterActions } from './router-actions';
import { createRouting } from './routing';
import { UrlParamsEncoder } from './url-params-encoder';
import { UrlParamEncoder } from './url-param-encoder';

type ListingEntry = ['N', Action<any>] | ['E', any] | ['C'];

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

function createRuleComponent(
  rule: RoutingRule<any>
): Component<RoutingRule<any>> {
  return {
    init(): ComponentInstance<RoutingRule<any>> {
      return {
        component: rule,
      };
    },
  };
}

function createTestHarness(
  actions: Observable<Action<any>>,
  {
    checkParent = () => EMPTY,
    commitParent = () => EMPTY,
    checkChild = () => EMPTY,
    commitChild = () => EMPTY,
  }: {
    checkParent?(context: RoutingRuleEvent<any>): Observable<Action>;
    commitParent?(context: RoutingRuleEvent<any>): Observable<Action>;
    checkChild?(context: RoutingRuleEvent<any>): Observable<Action>;
    commitChild?(context: RoutingRuleEvent<any>): Observable<Action>;
  } = {}
) {
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
        dispatchOnCheck: checkChild,
        dispatchOnCommit: commitChild,
      },
    ],
  });

  const parentRouting = createRouteConfig(parentRoute, {
    children: [childRouting],
    rules: [
      {
        dispatchOnCheck: checkParent,
        dispatchOnCommit: commitParent,
      },
    ],
  });

  const listing: ListingEntry[] = [];
  const listingEffect = createEffectComponent(() => ({
    name: 'listing',
    effects: {
      listing: (actions) =>
        merge(
          actions.ofType(routerActions.navigationRequested),
          actions.ofType(routerActions.navigationStarted),
          actions.ofType(routerActions.checkPhaseStarted),
          actions.ofType(routerActions.checkPhaseCompleted),
          actions.ofType(routerActions.commitPhaseStarted),
          actions.ofType(routerActions.commitPhaseCompleted),
          actions.ofType(routerActions.navigationCompleted),
          actions.ofType(routerActions.navigationCancelled),
          actions.ofType(routerActions.routeChecked),
          actions.ofType(routerActions.routeCommitted)
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
    },
  }));

  const container = createContainer();

  const actionsRef = container.use(actionsComponent);
  container.use(listingEffect);
  container.provide(
    routerConfigComponent,
    createComponent(() => parentRouting)
  );
  container.use(routerInitializerComponent);

  actions.subscribe((action) => actionsRef.component.dispatch(action));

  return {
    routerActions,
    listing,
    parentRouting,
    childRouting,
  };
}

describe('routing', () => {
  it('should emit navigation event', () => {
    const actions = new Subject<Action<any>>();
    const { routerActions, listing, parentRouting, childRouting } =
      createTestHarness(actions);

    actions.next(
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
    const routerState: any = undefined;
    expect(listing).toEqual([]);
  });

  describe('when parent rule resolves with false', () => {
    it('should emit navigation event', () => {
      const actions = new Subject<Action<any>>();
      const resolveParent = () =>
        of(routerActions.cancelNavigation({ reason: 'botak' }));
      const { routerActions, listing, parentRouting, childRouting } =
        createTestHarness(actions, { checkParent: resolveParent });

      actions.next(
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
      const actions = new Subject<Action<any>>();
      const resolveChild = () =>
        of(routerActions.cancelNavigation({ reason: 'botak' }));
      const { routerActions, listing, parentRouting, childRouting } =
        createTestHarness(actions, { checkChild: resolveChild });

      actions.next(
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
      const actions = new Subject<Action<any>>();
      const resolveParent = (context: RoutingRuleEvent<any>) => {
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
      const { routerActions, listing, parentRouting, childRouting } =
        createTestHarness(actions, { checkParent: resolveParent });

      actions.next(
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
      const actions = new Subject<Action<any>>();
      const resolveChild = (context: RoutingRuleEvent<any>) => {
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
      const { routerActions, listing, parentRouting, childRouting } =
        createTestHarness(actions, { checkChild: resolveChild });

      actions.next(
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
      const actions = new Subject<Action<any>>();
      let resolveParentSubject: Subject<Location | boolean>;
      const resolveParent = () => (resolveParentSubject = new Subject()) as any;
      const { routerActions, listing, parentRouting, childRouting } =
        createTestHarness(actions, { checkParent: resolveParent });

      actions.next(
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

      actions.next(
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
