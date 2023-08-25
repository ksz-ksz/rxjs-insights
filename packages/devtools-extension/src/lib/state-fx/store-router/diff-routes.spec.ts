import { ActiveRoute } from './active-route';
import { diffRoutes } from './diff-routes';

describe('diff-routes', () => {
  describe('when routes are the same', () => {
    it('should diff', () => {
      const prevRoutes: Partial<ActiveRoute<any, any, any>>[] = [
        { id: 0 },
        { id: 1 },
        { id: 2 },
      ];
      const nextRoutes: Partial<ActiveRoute<any, any, any>>[] = [
        { id: 0 },
        { id: 1 },
        { id: 2 },
      ];

      const result = diffRoutes(prevRoutes as any, nextRoutes as any);

      expect(result).toEqual({
        updatedRoutes: [
          [{ id: 0 }, { id: 0 }],
          [{ id: 1 }, { id: 1 }],
          [{ id: 2 }, { id: 2 }],
        ],
        activatedRoutes: [],
        deactivatedRoutes: [],
      });
    });
  });

  describe('when has common prefix', () => {
    it('should diff', () => {
      const prevRoutes: Partial<ActiveRoute<any, any, any>>[] = [
        { id: 0 },
        { id: 1 },
        { id: 2 },
      ];
      const nextRoutes: Partial<ActiveRoute<any, any, any>>[] = [
        { id: 0 },
        { id: 1 },
        { id: 3 },
        { id: 4 },
      ];

      const result = diffRoutes(prevRoutes as any, nextRoutes as any);

      expect(result).toEqual({
        updatedRoutes: [
          [{ id: 0 }, { id: 0 }],
          [{ id: 1 }, { id: 1 }],
        ],
        activatedRoutes: [{ id: 3 }, { id: 4 }],
        deactivatedRoutes: [{ id: 2 }],
      });
    });
  });
});
