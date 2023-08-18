export interface PathMatchedResult<T> {
  matched: true;
  path: string[];
  value: T;
}

export interface PathNotMatchedResult {
  matched: false;
  path?: never;
  value?: never;
}

export type PathMatchResult<T> = PathMatchedResult<T> | PathNotMatchedResult;

export interface PathFormatValidResult {
  valid: true;
  value: string[];
}
export interface PathFormatInvalidResult {
  valid: false;
  value?: never;
}

export type PathFormatResult = PathFormatValidResult | PathFormatInvalidResult;

export interface PathMatcher<T> {
  match(path: string[]): PathMatchResult<T>;

  format(value: T): PathFormatResult;
}
