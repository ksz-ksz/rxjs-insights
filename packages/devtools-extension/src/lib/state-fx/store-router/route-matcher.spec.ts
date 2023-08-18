import { z } from 'zod';
import { createRoute } from './route';
import { PathParam } from './path-param';
import { createRouting } from './routing';
import { RouteMatcher } from './route-matcher';
import { Params } from './params';

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

const searchRoute = createRoute({
  path: '',
  search: Params({
    q: z.coerce.string(),
  }),
});

describe('RouteMatcher', () => {
  it('should match featureListRoute', () => {
    const matcher = new RouteMatcher(rootRouting);

    const result = matcher.match('feature');

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
    const matcher = new RouteMatcher(rootRouting);

    const result = matcher.match('feature/42');

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
      const matcher = new RouteMatcher(rootRouting);

      const result = matcher.match('');

      expect(result).toEqual([]);
    });
  });

  describe('when pathname contains too many segments', () => {
    it('should not match', () => {
      const matcher = new RouteMatcher(rootRouting);

      const result = matcher.match('feature/42/dunno');

      expect(result).toEqual([]);
    });
  });

  describe('when pathname in unknown', () => {
    it('should not match', () => {
      const matcher = new RouteMatcher(rootRouting);

      const result = matcher.match('unknown/path/42');

      expect(result).toEqual([]);
    });
  });
});
