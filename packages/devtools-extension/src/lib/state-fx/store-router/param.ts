import { ZodType } from 'zod';
import {
  ParamType,
  ParamTypeFormatResult,
  ParamTypeParseResult,
} from './param-type';

export function Param<T>(type: ZodType<T>): ParamType<T> {
  return {
    parse(value: string): ParamTypeParseResult<T> {
      const result = type.safeParse(value);
      if (result.success) {
        return {
          valid: true,
          value: result.data,
        };
      } else {
        return {
          valid: false,
        };
      }
    },
    format(value: T): ParamTypeFormatResult {
      const result = type.safeParse(value);
      if (result.success) {
        return {
          valid: true,
          value: String(result.data),
        };
      } else {
        return {
          valid: false,
        };
      }
    },
  };
}
