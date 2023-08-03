import { ZodType } from 'zod';
import { ParamType } from './param-type';

export function Param<T>(type: ZodType<T>): ParamType<T> {
  return undefined as any;
}