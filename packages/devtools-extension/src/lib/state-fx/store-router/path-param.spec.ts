import { z } from 'zod';
import { PathParam } from './path-param';
import { PathMatchResult } from './path-matcher';

describe('PathParam', () => {
  describe('default', () => {
    describe('match', () => {
      describe('when param is valid', () => {
        describe('when path contains one element', () => {
          it('should match param', () => {
            const path = ['42'];
            const matcher = PathParam(z.coerce.number());

            const result: PathMatchResult<number> = matcher.match(path);

            expect(result).toEqual({
              matched: true,
              path: ['42'],
              value: 42,
            });
          });
        });
        describe('when path contains many elements', () => {
          it('should match param', () => {
            const path = ['42', 'foo'];
            const matcher = PathParam(z.coerce.number());

            const result: PathMatchResult<number> = matcher.match(path);

            expect(result).toEqual({
              matched: true,
              path: ['42'],
              value: 42,
            });
          });
        });
      });

      describe('when param is invalid', () => {
        it('should not match param', () => {
          const path = ['notanumber'];
          const matcher = PathParam(z.coerce.number());

          const result: PathMatchResult<number> = matcher.match(path);

          expect(result).toEqual({
            matched: false,
          });
        });
      });

      describe('when path in empty', () => {
        it('should not match param', () => {
          const path: string[] = [];
          const matcher = PathParam(z.coerce.number());

          const result: PathMatchResult<number> = matcher.match(path);

          expect(result).toEqual({
            matched: false,
          });
        });
      });
    });
  });

  describe('optional', () => {
    describe('match', () => {
      describe('when param is valid', () => {
        describe('when path contains one element', () => {
          it('should match param', () => {
            const path = ['42'];
            const matcher = PathParam(z.coerce.number(), { optional: true });

            const result: PathMatchResult<number | undefined> =
              matcher.match(path);

            expect(result).toEqual({
              matched: true,
              path: ['42'],
              value: 42,
            });
          });
        });
        describe('when path contains many elements', () => {
          it('should match param', () => {
            const path = ['42', 'foo'];
            const matcher = PathParam(z.coerce.number(), { optional: true });

            const result: PathMatchResult<number | undefined> =
              matcher.match(path);

            expect(result).toEqual({
              matched: true,
              path: ['42'],
              value: 42,
            });
          });
        });
      });

      describe('when param is invalid', () => {
        it('should not match param', () => {
          const path = ['notanumber'];
          const matcher = PathParam(z.coerce.number(), { optional: true });

          const result: PathMatchResult<number | undefined> =
            matcher.match(path);

          expect(result).toEqual({
            matched: false,
          });
        });
      });

      describe('when path in empty', () => {
        it('should not match param', () => {
          const path: string[] = [];
          const matcher = PathParam(z.coerce.number(), { optional: true });

          const result: PathMatchResult<number | undefined> =
            matcher.match(path);

          expect(result).toEqual({
            matched: true,
            path: [],
            value: undefined,
          });
        });
      });
    });
  });

  describe('variadic', () => {
    describe('match', () => {
      describe('when param is valid', () => {
        describe('when path contains one element', () => {
          it('should match param', () => {
            const path = ['42'];
            const matcher = PathParam(z.coerce.number(), { variadic: true });

            const result: PathMatchResult<number[]> = matcher.match(path);

            expect(result).toEqual({
              matched: true,
              path: ['42'],
              value: [42],
            });
          });
        });
        describe('when path contains many elements', () => {
          it('should match param', () => {
            const path = ['42', '7'];
            const matcher = PathParam(z.coerce.number(), { variadic: true });

            const result: PathMatchResult<number[]> = matcher.match(path);

            expect(result).toEqual({
              matched: true,
              path: ['42', '7'],
              value: [42, 7],
            });
          });
        });
      });

      describe('when param is invalid', () => {
        it('should not match param', () => {
          const path = ['42', 'notanumber'];
          const matcher = PathParam(z.coerce.number(), { variadic: true });

          const result: PathMatchResult<number[]> = matcher.match(path);

          expect(result).toEqual({
            matched: false,
          });
        });
      });

      describe('when path in empty', () => {
        it('should not match param', () => {
          const path: string[] = [];
          const matcher = PathParam(z.coerce.number(), { variadic: true });

          const result: PathMatchResult<number[]> = matcher.match(path);

          expect(result).toEqual({
            matched: false,
          });
        });
      });
    });
  });

  describe('optional variadic', () => {
    describe('match', () => {
      describe('when param is valid', () => {
        describe('when path contains one element', () => {
          it('should match param', () => {
            const path = ['42'];
            const matcher = PathParam(z.coerce.number(), {
              optional: true,
              variadic: true,
            });

            const result: PathMatchResult<number[] | undefined> =
              matcher.match(path);

            expect(result).toEqual({
              matched: true,
              path: ['42'],
              value: [42],
            });
          });
        });
        describe('when path contains many elements', () => {
          it('should match param', () => {
            const path = ['42', '7'];
            const matcher = PathParam(z.coerce.number(), {
              optional: true,
              variadic: true,
            });

            const result: PathMatchResult<number[] | undefined> =
              matcher.match(path);

            expect(result).toEqual({
              matched: true,
              path: ['42', '7'],
              value: [42, 7],
            });
          });
        });
      });

      describe('when param is invalid', () => {
        it('should not match param', () => {
          const path = ['42', 'notanumber'];
          const matcher = PathParam(z.coerce.number(), {
            optional: true,
            variadic: true,
          });

          const result: PathMatchResult<number[] | undefined> =
            matcher.match(path);

          expect(result).toEqual({
            matched: false,
          });
        });
      });

      describe('when path in empty', () => {
        it('should not match param', () => {
          const path: string[] = [];
          const matcher = PathParam(z.coerce.number(), {
            optional: true,
            variadic: true,
          });

          const result: PathMatchResult<number[] | undefined> =
            matcher.match(path);

          expect(result).toEqual({
            matched: true,
            path: [],
            value: undefined,
          });
        });
      });
    });
  });
});
