function normalizeObjectProperties(x: any) {
  const result: any = {};
  const keys = Object.keys(x);
  keys.sort();
  for (const key of keys) {
    const val = normalize(x[key]);
    if (val !== undefined) {
      result[key] = val;
    }
  }
  return result;
}

function normalizeObject(x: object) {
  if (x === null) {
    return null;
  }
  if (Array.isArray(x)) {
    return x.map(normalize);
  }
  return normalizeObjectProperties(x);
}

function normalize(x: any): any {
  switch (typeof x) {
    case 'object':
      return normalizeObject(x);
    case 'undefined':
    case 'boolean':
    case 'number':
    case 'string':
      return x;
    case 'symbol':
    case 'bigint':
      return String(x);
    case 'function':
      throw new Error('cannot serialize function');
  }
}

export function hash(x: any): string {
  return JSON.stringify(normalize(x));
}
