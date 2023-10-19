import { z } from 'zod';
import { ParamsEncoder } from './params';
import { createUrlParams, UrlParams } from './url-params';

function count(urlParams: UrlParams | undefined) {
  return urlParams !== undefined ? Array.from(urlParams).length : -1;
}

describe('ParamsEncoder', function () {
  describe('decode', function () {
    it('should decode params', function () {
      const paramsEncoder = new ParamsEncoder({
        foo: z.coerce.string(),
        bar: z.coerce.number(),
      });

      const result = paramsEncoder.decode(
        createUrlParams(['foo', '!@#$%^&*()_+'], ['bar', '15'])
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

        const result = paramsEncoder.decode(
          createUrlParams(['foo', 'asd'], ['bar', 'zxc'])
        );

        expect(result.valid).toBe(true);
        expect(result.value).toEqual({
          foo: 'asd',
        });
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
      expect(count(result.value)).toBe(2);
      expect(result.value?.get('foo')).toBe('!@#$%^&*()_+');
      expect(result.value?.get('bar')).toBe('42');
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
        expect(count(result.value)).toBe(1);
        expect(result.value?.get('foo')).toBe('asd');
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
        expect(count(result.value)).toBe(1);
        expect(result.value?.get('foo')).toBe('asd');
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
        expect(count(result.value)).toBe(1);
        expect(result.value?.get('foo')).toBe('asd');
      });
    });
  });
});
