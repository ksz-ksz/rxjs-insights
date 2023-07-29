export interface ParamTypeTransformValidResult<T> {
  valid: true;
  value: T;
}

export interface ParamTypeTransformInvalidResult {
  valid: false;
}

export type ParamTypeFormatResult =
  | ParamTypeTransformValidResult<string>
  | ParamTypeTransformInvalidResult;

export type ParamTypeParseResult<T> =
  | ParamTypeTransformValidResult<T>
  | ParamTypeTransformInvalidResult;

export interface ParamType<T> {
  format(value: T): ParamTypeFormatResult;

  parse(value: string): ParamTypeParseResult<T>;
}

export type ParamTypeFactory<T, TOptions> = ParamType<T> &
  ((options: TOptions) => ParamType<T>);
