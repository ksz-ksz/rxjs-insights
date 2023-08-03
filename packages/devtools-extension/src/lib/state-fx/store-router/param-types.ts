import { ParamType } from './param-type';

export type ParamTypes<TParams> = {
  [TKey in keyof TParams]: ParamType<TParams[TKey]>;
};