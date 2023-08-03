export interface ParamValidator<T> {
  (value: T): boolean;
}

export function isParamValueValid<T>(
  value: T,
  validators: ParamValidator<T>[]
) {
  for (const validator of validators) {
    if (!validator(value)) {
      return false;
    }
  }
  return true;
}
