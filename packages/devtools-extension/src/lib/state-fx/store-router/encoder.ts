export interface EncoderTransformValidResult<T> {
  valid: true;
  value: T;
}

export interface EncoderTransformInvalidResult {
  valid: false;
  value?: never;
}

export type EncoderEncodeResult =
  | EncoderTransformValidResult<string>
  | EncoderTransformInvalidResult;

export type EncoderDecodeResult<T> =
  | EncoderTransformValidResult<T>
  | EncoderTransformInvalidResult;

export interface Encoder<T> {
  encode(value: T): EncoderEncodeResult;

  decode(value: string): EncoderDecodeResult<T>;
}
