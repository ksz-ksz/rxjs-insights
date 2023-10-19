import { Encoder, EncoderResult } from './encoder';
import { safeDecode } from './safe-decode';

export class UrlParamEncoder<T> implements Encoder<string, string> {
  decode(value: string): EncoderResult<string> {
    return {
      valid: true,
      value: safeDecode(value),
    };
  }
  encode(value: string): EncoderResult<string> {
    return {
      valid: true,
      value: encodeURIComponent(value),
    };
  }
}
