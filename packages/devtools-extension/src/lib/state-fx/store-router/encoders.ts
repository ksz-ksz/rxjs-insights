import { Encoder } from './encoder';

export type Encoders<T> = {
  [TKey in keyof T]: Encoder<T[TKey]>;
};
