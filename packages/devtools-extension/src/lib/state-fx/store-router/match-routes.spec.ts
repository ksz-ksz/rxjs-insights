import { z } from 'zod';
import { createRoute } from './route';
import { PathParam } from './path-param';
import { createRouting } from './routing';
import { matchRoutes } from './match-routes';

const rootRoute = createRoute({
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

const featureListRouting = createRouting({
  route: featureListRoute,
});

const featureDetailsRouting = createRouting({
  route: featureDetailsRoute,
});

const featureRouting = createRouting({
  route: featureRoute,
  children: [featureListRouting, featureDetailsRouting],
});

const rootRouting = createRouting({
  route: rootRoute,
  children: [featureRouting],
});

describe('RouteMatcher', () => {
  it('should match featureListRoute', () => {
    const result = matchRoutes(rootRouting, 'feature');

    expect(result).toEqual([
      {
        routing: rootRouting,
        path: [],
        params: {},
      },
      {
        path: ['feature'],
        params: {},
        routing: featureRouting,
      },
      { path: [], params: {}, routing: featureListRouting },
    ]);
  });

  it('should match featureDetailsRoute', () => {
    const result = matchRoutes(rootRouting, 'feature/42');

    expect(result).toEqual([
      {
        routing: rootRouting,

        path: [],
        params: {},
      },
      {
        routing: featureRouting,

        path: ['feature'],
        params: {},
      },
      {
        routing: featureDetailsRouting,

        path: ['42'],
        params: {
          featureId: 42,
        },
      },
    ]);
  });

  describe('when pathname is empty', () => {
    it('should not match', () => {
      const result = matchRoutes(rootRouting, '');

      expect(result).toEqual([]);
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