export class Base<T> {
  constructor(private snapshot: T) {}

  get(): T;
  get<U>(change: U): T & U;
  get(change?: any): any {
    if (change !== undefined) {
      return patch(this.snapshot, change);
    }
    return this.snapshot;
  }
}

export class Diff<T> {
  constructor(private snapshot: T) {}

  get(change?: Partial<T>) {
    if (change !== undefined) {
      this.snapshot = patch(this.snapshot, change);
    }
    return this.snapshot;
  }
}

function patch<T, U>(base: T, change: U): T & U {
  const result: any = { ...base };
  for (const key of Object.keys(change)) {
    // @ts-ignore
    const baseVal = base[key];
    // @ts-ignore
    const changeVal = change[key];
    if (
      typeof baseVal === 'object' &&
      baseVal !== null &&
      !Array.isArray(baseVal)
    ) {
      if (changeVal === undefined) {
        result[key] = undefined;
      } else {
        result[key] = patch(baseVal, changeVal);
      }
    } else {
      result[key] = changeVal;
    }
  }
  return result;
}
