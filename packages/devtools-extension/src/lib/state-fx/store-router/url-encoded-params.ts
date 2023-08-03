import { ParamType } from './param-type';
import { ParamTypes } from './param-types';

export function URLEncodedParams<T>(
  params: ParamTypes<T>
): ParamType<Partial<T>> {
  return undefined as any;
}
