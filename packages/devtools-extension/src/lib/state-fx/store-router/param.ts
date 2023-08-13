import { Encoder } from './encoder';
import { ZodType } from 'zod';
import { safeDecode } from './safe-decode';

export const Param =
  <T>(param: ZodType<T>) =>
  (): Encoder<T> => {
    return new ParamEncoder(param);
  };

export class ParamEncoder<T> implements Encoder<T> {
  constructor(readonly param: ZodType<T>) {}

  decode(value: string) {
    const result = this.param.safeParse(safeDecode(value));
    if (result.success) {
      return {
        valid: true,
        value: result.data,
      } as const;
    } else {
      return {
        valid: false,
      } as const;
    }
  }
  encode(value: T) {
    const result = this.param.safeParse(value);
    if (result.success) {
      return {
        valid: true,
        value: encodeURIComponent(String(result.data)),
      } as const;
    } else {
      return {
        valid: false,
      } as const;
    }
  }
}
