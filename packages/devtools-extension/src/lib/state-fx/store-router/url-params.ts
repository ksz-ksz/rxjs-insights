export function createUrlParams(...entries: [string, string][]) {
  return new UrlParams(appendValues(new Map(), entries));
}

export class UrlParams {
  *[Symbol.iterator]() {
    for (let [key, vals] of this.map.entries()) {
      for (let val of vals) {
        yield [key, val] as const;
      }
    }
  }
  constructor(private readonly map: Map<string, string[]>) {}

  get(key: string) {
    return this.map.get(key)?.[0];
  }

  getAll(key: string) {
    return this.map.get(key);
  }

  set(...entries: [string, string][]) {
    return setValues(new Map(this.map), entries);
  }

  append(...entries: [string, string][]) {
    return appendValues(new Map(this.map), entries);
  }
}

function appendValues(map: Map<string, string[]>, entries: [string, string][]) {
  for (const [key, val] of entries) {
    const vals = map.get(key);
    if (vals !== undefined) {
      vals.push(val);
    } else {
      map.set(key, [val]);
    }
  }
  return map;
}

function setValues(map: Map<string, string[]>, entries: [string, string][]) {
  for (const [key, val] of entries) {
    map.set(key, [val]);
  }
  return map;
}
