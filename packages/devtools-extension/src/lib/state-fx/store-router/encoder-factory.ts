import { Encoder } from './encoder';

export interface EncoderFactory<T, TParent> {
  (parent?: Encoder<TParent>): Encoder<T>;
}
