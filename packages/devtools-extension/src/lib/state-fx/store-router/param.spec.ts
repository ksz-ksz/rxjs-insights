import { ParamEncoder } from './param';
import { z } from 'zod';

describe('ParamEncoder', function () {
  describe('decode', function () {
    it('should decode value', function () {
      const paramEncoder = new ParamEncoder(z.coerce.number());

      const result = paramEncoder.decode('42');

      expect(result.valid).toBe(true);
      expect(result.value).toEqual(42);
    });
  });

  describe('encode', function () {
    it('should encode value', function () {
      const paramEncoder = new ParamEncoder(z.coerce.number());

      const result = paramEncoder.encode(42);

      expect(result.valid).toBe(true);
      expect(result.value).toEqual('42');
    });
  });
});
