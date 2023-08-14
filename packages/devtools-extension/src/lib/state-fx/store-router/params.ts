import { Encoder } from './encoder';
import { ZodType } from 'zod';
import { safeDecode } from './safe-decode';

export type ZodTypes<T> = {
  [K in keyof T]: ZodType<T[K]>;
};

export function Params<T, TParent>(
  params: ZodTypes<T>
): (parent?: Encoder<TParent>) => Encoder<Partial<T> & TParent> {
  // @ts-ignore
  return (parent) => {
    if (parent === undefined) {
      return new ParamsEncoder<any>(params);
    }
    if (parent instanceof ParamsEncoder) {
      return new ParamsEncoder<any>({
        ...parent.params,
        ...params,
      });
    }
    throw new Error('cannot extend parent encoder');
  };
}

function decodeParams(string: string): Record<string, string> {
  const params: Record<string, string> = {};
  for (let pair of string.split('&')) {
    const [key, val] = pair.split('=');
    const decodedKey = key !== undefined ? safeDecode(key) : '';
    const decodedVal = val !== undefined ? safeDecode(val) : '';
    params[decodedKey] = decodedVal;
  }
  return params;
}

function encodeParams(params: Record<string, string>): string {
  const pairs: string[] = [];
  for (const key in params) {
    const val = params[key];
    const encodedKey = encodeURIComponent(key);
    const encodedVal = encodeURIComponent(val);
    pairs.push(`${encodedKey}=${encodedVal}`);
  }
  return pairs.join('&');
}

export class ParamsEncoder<T> implements Encoder<Partial<T>> {
  constructor(readonly params: ZodTypes<T>) {}

  decode(value: string) {
    const parsedParams: Partial<T> = {};
    try {
      const decodedParams = decodeParams(value);
      for (const paramKey in this.params) {
        const param = this.params[paramKey];
        const paramValue = decodedParams[paramKey];
        if (paramValue !== undefined) {
          const result = param.safeParse(paramValue);
          if (result.success) {
            parsedParams[paramKey] = result.data;
          }
        }
      }
      return { valid: true, value: parsedParams } as const;
    } catch (e) {
      return { valid: false } as const;
    }
  }

  encode(value: Partial<T>) {
    if (typeof value !== 'object' || value === null) {
      return { valid: false } as const;
    }
    const params: Record<string, string> = {};
    for (const paramKey in this.params) {
      const param = this.params[paramKey];
      const paramValue = value[paramKey];
      if (paramValue !== undefined) {
        const result = param.safeParse(paramValue as any);
        if (result.success) {
          params[paramKey] = String(result.data);
        }
      }
    }

    return { valid: true, value: encodeParams(params) } as const;
  }
}
