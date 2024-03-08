import { Encoder, EncoderResult } from './encoder';
import { safeDecode } from './safe-decode';
import { Merger } from './merger';

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

export class UrlParamMerger implements Merger<string> {
  merge(base: string, ext: string): string {
    return ext;
  }
}
