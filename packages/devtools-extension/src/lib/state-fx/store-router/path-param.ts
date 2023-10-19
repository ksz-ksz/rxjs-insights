import { PathFormatResult, PathMatcher, PathMatchResult } from './path-matcher';
import { composeEncoders, Encoder } from './encoder';
import { ZodType } from 'zod';
import { ParamEncoder } from './param';
import { UrlParamsEncoder } from './url-params-encoder';
import { UrlParamEncoder } from './url-param-encoder';

export interface PathParamOptions {
  optional?: boolean;
  variadic?: boolean;
}

export function PathParam<T>(
  param: ZodType<T>,
  options?: { optional?: false; variadic?: false }
): PathMatcher<T>;
export function PathParam<T>(
  param: ZodType<T>,
  options: { optional: true }
): PathMatcher<T | undefined>;
export function PathParam<T>(
  param: ZodType<T>,
  options: { variadic: true }
): PathMatcher<T[]>;
export function PathParam<T>(
  param: ZodType<T>,
  options: { optional: true; variadic: true }
): PathMatcher<T[] | undefined>;
export function PathParam(
  param: ZodType,
  { optional = false, variadic = false }: PathParamOptions = {}
): PathMatcher<any> {
  if (variadic) {
    return new VariadicPathParamMatcher(
      composeEncoders(new UrlParamEncoder(), new ParamEncoder(param)),
      optional
    );
  } else {
    return new PathParamMatcher(
      composeEncoders(new UrlParamEncoder(), new ParamEncoder(param)),
      optional
    );
  }
}

export class PathParamMatcher<T> implements PathMatcher<T | undefined> {
  constructor(
    readonly encoder: Encoder<string, T>,
    readonly optional: boolean
  ) {}

  match(path: string[]): PathMatchResult<T | undefined> {
    if (path.length === 0) {
      if (this.optional) {
        return {
          matched: true,
          path: [],
          value: undefined,
        };
      } else {
        return {
          matched: false,
        };
      }
    }

    const [pathSegment] = path;
    const result = this.encoder.decode(pathSegment);
    if (result.valid) {
      return {
        matched: true,
        path: [pathSegment],
        value: result.value,
      };
    } else {
      return {
        matched: false,
      };
    }
  }
  format(value: T | undefined): PathFormatResult {
    if (value === undefined) {
      if (this.optional) {
        return {
          valid: true,
          value: [],
        };
      } else {
        return {
          valid: false,
        };
      }
    }

    const result = this.encoder.encode(value);
    if (result.valid) {
      return {
        valid: true,
        value: [result.value],
      };
    } else {
      return {
        valid: false,
      };
    }
  }
}

export class VariadicPathParamMatcher<T>
  implements PathMatcher<T[] | undefined>
{
  constructor(
    readonly encoder: Encoder<string, T>,
    readonly optional: boolean
  ) {}

  match(path: string[]): PathMatchResult<T[] | undefined> {
    if (path.length === 0) {
      if (this.optional) {
        return {
          matched: true,
          path: [],
          value: undefined,
        };
      } else {
        return {
          matched: false,
        };
      }
    }

    const value: T[] = [];

    for (let pathSegment of path) {
      const result = this.encoder.decode(pathSegment);
      if (result.valid) {
        value.push(result.value);
      } else {
        return {
          matched: false,
        };
      }
    }

    return {
      matched: true,
      path,
      value,
    };
  }
  format(values: T[] | undefined): PathFormatResult {
    if (values === undefined) {
      if (this.optional) {
        return {
          valid: true,
          value: [],
        };
      } else {
        return {
          valid: false,
        };
      }
    }

    const path: string[] = [];

    for (const value of values) {
      const result = this.encoder.encode(value);
      if (result.valid) {
        path.push(result.value);
      } else {
        return {
          valid: false,
        };
      }
    }

    return { valid: true, value: path };
  }
}
