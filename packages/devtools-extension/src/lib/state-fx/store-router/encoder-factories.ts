import { EncoderFactory } from './encoder-factory';

export type EncoderFactories<T> = {
  [TKey in keyof T]: EncoderFactory<T[TKey], unknown>;
};
