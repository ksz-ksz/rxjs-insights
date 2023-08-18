import { PathMatcher } from './path-matcher';

export type PathMatchers<T> = {
  [TKey in keyof T]: PathMatcher<T[TKey]>;
};