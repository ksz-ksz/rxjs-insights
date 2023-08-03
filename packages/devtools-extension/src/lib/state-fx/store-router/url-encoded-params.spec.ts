import { URLEncodedParams } from './url-encoded-params';
import { Param } from './param';
import { z } from 'zod';

describe('URLEncodedParams', function () {
  describe('parse', function () {
    it('should parse params', function () {
      const urlEncodedParams = URLEncodedParams({
        foo: Param(z.coerce.string()),
        bar: Param(z.coerce.number()),
      });

      const result = urlEncodedParams.parse('foo=asd&bar=15');

      expect(result.valid).toBe(true);
      expect(result.value).toEqual({
        foo: 'asd',
        bar: 15,
      });
    });

    describe('when some of the params are invalid', function () {
      it('should parse valid params', function () {
        const urlEncodedParams = URLEncodedParams({
          foo: Param(z.coerce.string()),
          bar: Param(z.coerce.number()),
        });

        const result = urlEncodedParams.parse('foo=asd&bar=zxc');

        expect(result.valid).toBe(true);
        expect(result.value).toEqual({
          foo: 'asd',
        });
      });
    });

    describe('when search string is garbage', function () {
      it('should return an empty object', function () {
        const urlEncodedParams = URLEncodedParams({
          foo: Param(z.coerce.string()),
          bar: Param(z.coerce.number()),
        });

        const result = urlEncodedParams.parse('!@#$%^&*())_');

        expect(result.valid).toBe(true);
        expect(result.value).toEqual({});
      });
    });
  });

  describe('format', function () {
    it('should format params', function () {
      const urlEncodedParams = URLEncodedParams({
        foo: Param(z.coerce.string()),
        bar: Param(z.coerce.number()),
      });

      const result = urlEncodedParams.format({
        foo: 'asd',
        bar: 42,
      });

      expect(result.valid).toBe(true);
      expect(result.value).toBe('foo=asd&bar=42');
    });

    describe('when some of the params are invalid', function () {
      it('should format valid params', function () {
        const urlEncodedParams = URLEncodedParams({
          foo: Param(z.coerce.string()),
          bar: Param(z.coerce.number()),
        });

        const result = urlEncodedParams.format({
          foo: 'asd',
          bar: 'bob',
        } as any);

        expect(result.valid).toBe(true);
        expect(result.value).toBe('foo=asd');
      });
    });

    describe('when some of the params are missing', function () {
      it('should format valid params', function () {
        const urlEncodedParams = URLEncodedParams({
          foo: Param(z.coerce.string()),
          bar: Param(z.coerce.number()),
        });

        const result = urlEncodedParams.format({
          foo: 'asd',
        });

        expect(result.valid).toBe(true);
        expect(result.value).toBe('foo=asd');
      });
    });

    describe('when some of the params are unknown', function () {
      it('should format valid params', function () {
        const urlEncodedParams = URLEncodedParams({
          foo: Param(z.coerce.string()),
        });

        const result = urlEncodedParams.format({
          foo: 'asd',
          wtf: 'unknown param',
        } as any);

        expect(result.valid).toBe(true);
        expect(result.value).toBe('foo=asd');
      });
    });
  });
});
