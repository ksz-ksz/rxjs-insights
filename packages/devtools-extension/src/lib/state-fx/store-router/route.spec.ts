import { createRouteFactory } from './route';
import { Param } from './param';
import { z } from 'zod';
import { Params } from './params';
import { PathParam } from './path-param';
import { UrlParamsEncoder } from './url-params-encoder';
import { UrlParamEncoder } from './url-param-encoder';

const createRoute = createRouteFactory({
  searchEncoder: new UrlParamsEncoder(),
  hashEncoder: new UrlParamEncoder(),
});

describe('route', function () {
  describe('createRoute', function () {
    describe('createPath', function () {
      it('should create path', function () {
        const featureRoute = createRoute({
          path: 'feature',
        });

        const path = featureRoute();

        expect(path).toEqual({
          pathname: 'feature',
          search: '',
          hash: '',
        });
      });

      it('should create path with params', function () {
        const featureRoute = createRoute({
          path: 'feature/:id',
          params: {
            id: PathParam(z.coerce.number()),
          },
          search: Params({
            foo: z.coerce.boolean(),
          }),
          hash: Param(z.coerce.string()),
        });

        const path = featureRoute({
          params: {
            id: 42,
          },
          search: {
            foo: true,
          },
          hash: 'bar',
        });

        expect(path).toEqual({
          pathname: 'feature/42',
          search: '?foo=true',
          hash: '#bar',
        });
      });

      it('should encode path segments, search hand hash', () => {
        const featureRoute = createRoute({
          path: '!@#/:val',
          params: {
            val: PathParam(z.coerce.string()),
          },
          search: Params({
            val: z.coerce.string(),
          }),
          hash: Param(z.coerce.string()),
        });

        const path = featureRoute({
          params: {
            val: '$%^',
          },
          search: {
            val: '&*(',
          },
          hash: ')_+',
        });

        expect(path).toEqual({
          pathname: '!@#/%24%25%5E',
          search: '?val=%26*(',
          hash: '#)_%2B',
        });
      });

      describe('when has parent route', function () {
        it('should create path', function () {
          const rootRoute = createRoute({
            path: 'root',
          });
          const featureRoute = createRoute({
            parent: rootRoute,
            path: 'feature',
          });

          const path = featureRoute();

          expect(path).toEqual({
            pathname: 'root/feature',
            search: '',
            hash: '',
          });
        });

        it('should create path with params', function () {
          const rootRoute = createRoute({
            path: 'root/:type',
            params: {
              type: PathParam(z.enum(['a', 'b'])),
            },
            search: Params({
              devmode: z.coerce.boolean(),
            }),
            hash: Param(z.coerce.number()),
          });
          const featureRoute = createRoute({
            parent: rootRoute,
            path: 'feature/:id',
            params: {
              id: PathParam(z.coerce.number()),
            },
            search: Params({
              foo: z.coerce.boolean(),
            }),
            hash: Param(z.coerce.string()),
          });

          const path = featureRoute({
            params: {
              type: 'a',
              id: 42,
            },
            search: {
              devmode: false,
              foo: true,
            },
            hash: 'bar',
          });

          expect(path).toEqual({
            pathname: 'root/a/feature/42',
            search: '?devmode=false&foo=true',
            hash: '#bar',
          });
        });
      });
    });
  });
});
