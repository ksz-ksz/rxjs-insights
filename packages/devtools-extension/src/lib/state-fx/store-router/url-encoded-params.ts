import {
  ParamType,
  ParamTypeFormatResult,
  ParamTypeParseResult,
} from './param-type';
import { ParamTypes } from './param-types';

export function URLEncodedParams<T>(
  params: ParamTypes<T>
): ParamType<Partial<T>> {
  return {
    parse(value: string): ParamTypeParseResult<Partial<T>> {
      const parsedParams: Partial<T> = {};
      try {
        const urlSearchParams = new URLSearchParams(value);
        for (const paramKey in params) {
          const param = params[paramKey];
          const paramValue = urlSearchParams.get(paramKey);
          if (paramValue !== null) {
            const result = param.parse(paramValue);
            if (result.valid) {
              parsedParams[paramKey] = result.value;
            }
          }
        }
        return { valid: true, value: parsedParams };
      } catch (e) {
        return { valid: false };
      }
    },
    format(value: Partial<T>): ParamTypeFormatResult {
      if (typeof value !== 'object' || value === null) {
        return { valid: false };
      }
      const urlSearchParams = new URLSearchParams();
      for (const paramKey in params) {
        const param = params[paramKey];
        const paramValue = value[paramKey];
        if (paramValue !== null) {
          const result = param.format(paramValue as any);
          if (result.valid) {
            urlSearchParams.set(paramKey, result.value);
          }
        }
      }

      return { valid: true, value: urlSearchParams.toString() };
    },
  };
}
