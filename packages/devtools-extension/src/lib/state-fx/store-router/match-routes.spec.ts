import { z } from 'zod';
import { createRoute } from './route';
import { PathParam } from './path-param';
import { createRouteConfig } from './route-config';
import { matchRoutes } from './match-routes';

const rootRoute = createRoute({
  path: '',
});

const homeRoute = createRoute({
  parent: rootRoute,
  path: '',
});

const featureRoute = createRoute({
  parent: rootRoute,
  path: 'feature',
});

const featureListRoute = createRoute({
  parent: featureRoute,
  path: '',
});

const featureDetailsRoute = createRoute({
  parent: featureRoute,
  path: ':featureId',
  params: {
    featureId: PathParam(z.coerce.number()),
  },
});

const homeRouting = createRouteConfig(homeRoute);

const featureListRouting = createRouteConfig(featureListRoute);

const featureDetailsRouting = createRouteConfig(featureDetailsRoute);

const featureRouting = createRouteConfig(featureRoute, {
  children: [featureListRouting, featureDetailsRouting],
});

const rootRouting = createRouteConfig(rootRoute, {
  children: [homeRouting, featureRouting],
});

describe('RouteMatcher', () => {
  it('should match featureListRoute', () => {
    const result = matchRoutes(rootRouting, 'feature');

    expect(result).toEqual([
      {
        routeConfig: rootRouting,
        path: [],
        params: {},
      },
      {
        routeConfig: featureRouting,
        path: ['feature'],
        params: {},
      },
      { path: [], params: {}, routeConfig: featureListRouting },
    ]);
  });

  it('should match featureDetailsRoute', () => {
    const result = matchRoutes(rootRouting, 'feature/42');

    expect(result).toEqual([
      {
        routeConfig: rootRouting,

        path: [],
        params: {},
      },
      {
        routeConfig: featureRouting,

        path: ['feature'],
        params: {},
      },
      {
        routeConfig: featureDetailsRouting,

        path: ['42'],
        params: {
          featureId: 42,
        },
      },
    ]);
  });

  describe('when pathname is empty', () => {
    it('should match homeRoute', () => {
      const result = matchRoutes(rootRouting, '');

      expect(result).toEqual([
        {
          routeConfig: rootRouting,
          path: [],
          params: {},
        },
        {
          routeConfig: homeRouting,
          path: [],
          params: {},
        },
      ]);
    });
  });

  describe('when pathname contains too many segments', () => {
    it('should not match', () => {
      const result = matchRoutes(rootRouting, 'feature/42/dunno');

      expect(result).toEqual([]);
    });
  });

  describe('when pathname in unknown', () => {
    it('should not match', () => {
      const result = matchRoutes(rootRouting, 'unknown/path/42');

      expect(result).toEqual([]);
    });
  });
});
