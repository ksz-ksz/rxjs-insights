export interface Merger<T> {
  merge(base: T, ext: T): T;
}
