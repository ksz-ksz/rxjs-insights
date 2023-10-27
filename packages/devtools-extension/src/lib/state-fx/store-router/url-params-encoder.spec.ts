import { UrlParamsEncoder } from './url-params-encoder';
import { createUrlParams, UrlParams } from './url-params';

function count(urlParams: UrlParams | undefined) {
  return urlParams !== undefined ? Array.from(urlParams).length : -1;
}

describe('UrlParamsEncoder', function () {
  describe('decode', function () {
    it('should decode params', function () {
      const paramsEncoder = new UrlParamsEncoder();

      const result = paramsEncoder.decode(
        'foo=%21%40%23%24%25%5E%26*%28%29_%2B&bar=15'
      );

      expect(result.valid).toBe(true);
      expect(count(result.value)).toBe(2);
      expect(result.value?.get('foo')).toBe('!@#$%^&*()_+');
      expect(result.value?.get('bar')).toBe('15');
    });
    describe('when input is empty', () => {
      it('should decode params', function () {
        const paramsEncoder = new UrlParamsEncoder();

        const result = paramsEncoder.decode('');

        expect(result.valid).toBe(true);
        expect(count(result.value)).toBe(0);
      });
    });
  });

  describe('encode', function () {
    it('should encode params', function () {
      const paramsEncoder = new UrlParamsEncoder();

      const result = paramsEncoder.encode(
        createUrlParams(['foo', '!@#$%^&*()_+'], ['bar', '42'])
      );

      expect(result.valid).toBe(true);
      expect(result.value).toBe('foo=!%40%23%24%25%5E%26*()_%2B&bar=42');
    });
    describe('when there are no params', () => {
      it('should encode params', function () {
        const paramsEncoder = new UrlParamsEncoder();

        const result = paramsEncoder.encode(createUrlParams());

        expect(result.valid).toBe(true);
        expect(result.value).toBe('');
      });
    });
  });
});
