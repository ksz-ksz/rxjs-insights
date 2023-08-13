import { ParamEncoder } from './param';
import { z } from 'zod';

describe('ParamEncoder', function () {
  describe('decode', function () {
    it('should decode value', function () {
      const paramEncoder = new ParamEncoder(z.coerce.string());

      const result = paramEncoder.decode('%21%40%23%24%25%5E%26*%28%29_%2B');

      expect(result.valid).toBe(true);
      expect(result.value).toEqual('!@#$%^&*()_+');
    });
  });

  describe('encode', function () {
    it('should encode value', function () {
      const paramEncoder = new ParamEncoder(z.coerce.string());

      const result = paramEncoder.encode('!@#$%^&*()_+');

      expect(result.valid).toBe(true);
      expect(result.value).toEqual('!%40%23%24%25%5E%26*()_%2B');
    });
  });
});
