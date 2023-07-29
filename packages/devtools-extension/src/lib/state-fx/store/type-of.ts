export function typeOf<T>(): T | undefined;
export function typeOf<T>(value: T): T;
export function typeOf<T>(value?: T): T | undefined {
  return value;
}
