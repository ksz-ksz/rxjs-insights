import { Encoder } from './encoder';
import { ZodType } from 'zod';
import { createUrlParams, UrlParams } from './url-params';

export type ZodTypes<T> = {
  [K in keyof T]: ZodType<T[K]>;
};

export function Params<T, TParent>(
  params: ZodTypes<T>
): (
  parent?: Encoder<UrlParams, TParent>
) => Encoder<UrlParams, Partial<T> & TParent> {
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

export class ParamsEncoder<T> implements Encoder<UrlParams, Partial<T>> {
  constructor(readonly params: ZodTypes<T>) {}

  decode(value: UrlParams) {
    const parsedParams: Partial<T> = {};
    try {
      for (const paramKey in this.params) {
        const param = this.params[paramKey];
        const paramValue = value.get(paramKey);
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
    const entries: [string, string][] = [];
    for (const paramKey in this.params) {
      const param = this.params[paramKey];
      const paramValue = value[paramKey];
      if (paramValue !== undefined) {
        const result = param.safeParse(paramValue as any);
        if (result.success) {
          entries.push([paramKey, String(result.data)]);
        }
      }
    }

    return { valid: true, value: createUrlParams(...entries) } as const;
  }
}
