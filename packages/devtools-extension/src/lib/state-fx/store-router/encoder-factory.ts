import { Encoder } from './encoder';

export interface EncoderFactory<TInput, T, TParent> {
  (parent?: Encoder<TInput, TParent>): Encoder<TInput, T>;
}
