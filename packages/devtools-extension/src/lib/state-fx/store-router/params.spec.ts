import { z } from 'zod';
import { ParamsEncoder } from './params';

describe('ParamsEncoder', function () {
  describe('decode', function () {
    it('should decode params', function () {
      const paramsEncoder = new ParamsEncoder({
        foo: z.coerce.string(),
        bar: z.coerce.number(),
      });

      const result = paramsEncoder.decode(
        'foo=%21%40%23%24%25%5E%26*%28%29_%2B&bar=15'
      );

      expect(result.valid).toBe(true);
      expect(result.value).toEqual({
        foo: '!@#$%^&*()_+',
        bar: 15,
      });
    });

    describe('when some of the params are invalid', function () {
      it('should decode valid params', function () {
        const paramsEncoder = new ParamsEncoder({
          foo: z.coerce.string(),
          bar: z.coerce.number(),
        });

        const result = paramsEncoder.decode('foo=asd&bar=zxc');

        expect(result.valid).toBe(true);
        expect(result.value).toEqual({
          foo: 'asd',
        });
      });
    });

    describe('when search string is garbage', function () {
      it('should return an empty object', function () {
        const paramsEncoder = new ParamsEncoder({
          foo: z.coerce.string(),
          bar: z.coerce.number(),
        });

        const result = paramsEncoder.decode('!@#$%^&*())_');

        expect(result.valid).toBe(true);
        expect(result.value).toEqual({});
      });
    });
  });

  describe('encode', function () {
    it('should encode params', function () {
      const paramsEncoder = new ParamsEncoder({
        foo: z.coerce.string(),
        bar: z.coerce.number(),
      });

      const result = paramsEncoder.encode({
        foo: '!@#$%^&*()_+',
        bar: 42,
      });

      expect(result.valid).toBe(true);
      expect(result.value).toBe('foo=!%40%23%24%25%5E%26*()_%2B&bar=42');
    });

    describe('when some of the params are invalid', function () {
      it('should encode valid params', function () {
        const paramsEncoder = new ParamsEncoder({
          foo: z.coerce.string(),
          bar: z.coerce.number(),
        });

        const result = paramsEncoder.encode({
          foo: 'asd',
          bar: 'bob',
        } as any);

        expect(result.valid).toBe(true);
        expect(result.value).toBe('foo=asd');
      });
    });

    describe('when some of the params are missing', function () {
      it('should encode valid params', function () {
        const paramsEncoder = new ParamsEncoder({
          foo: z.coerce.string(),
          bar: z.coerce.number(),
        });

        const result = paramsEncoder.encode({
          foo: 'asd',
        });

        expect(result.valid).toBe(true);
        expect(result.value).toBe('foo=asd');
      });
    });

    describe('when some of the params are unknown', function () {
      it('should encode valid params', function () {
        const paramsEncoder = new ParamsEncoder({
          foo: z.coerce.string(),
        });

        const result = paramsEncoder.encode({
          foo: 'asd',
          wtf: 'unknown param',
        } as any);

        expect(result.valid).toBe(true);
        expect(result.value).toBe('foo=asd');
      });
    });
  });
});
