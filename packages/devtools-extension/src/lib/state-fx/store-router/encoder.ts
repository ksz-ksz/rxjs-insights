export interface EncoderTransformValidResult<T> {
  valid: true;
  value: T;
}

export interface EncoderTransformInvalidResult {
  valid: false;
  value?: never;
}

export type EncoderResult<T> =
  | EncoderTransformValidResult<T>
  | EncoderTransformInvalidResult;

export interface Encoder<TEncoded, TDecoded> {
  encode(value: TDecoded): EncoderResult<TEncoded>;

  decode(value: TEncoded): EncoderResult<TDecoded>;
}

export function composeEncoders<TEncoded, TMiddle, TDecoded>(
  a: Encoder<TEncoded, TMiddle>,
  b: Encoder<TMiddle, TDecoded>
): Encoder<TEncoded, TDecoded> {
  return {
    encode(value: TDecoded): EncoderResult<TEncoded> {
      const result = b.encode(value);
      if (result.valid) {
        return a.encode(result.value);
      } else {
        return result;
      }
    },
    decode(value: TEncoded): EncoderResult<TDecoded> {
      const result = a.decode(value);
      if (result.valid) {
        return b.decode(result.value);
      } else {
        return result;
      }
    },
  };
}
