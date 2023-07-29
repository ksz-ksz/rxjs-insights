interface ParamTypeTransformValidResult<T> {
  valid: true;
  value: T;
}

interface ParamTypeTransformInvalidResult {
  valid: false;
}

type ParamTypeFormatResult =
  | ParamTypeTransformValidResult<string>
  | ParamTypeTransformInvalidResult;

type ParamTypeParseResult<T> =
  | ParamTypeTransformValidResult<T>
  | ParamTypeTransformInvalidResult;

interface ParamType<T> {
  format(value: T): ParamTypeFormatResult;
  parse(value: string): ParamTypeParseResult<T>;
}

export type ParamTypeFactory<T, TOptions> = ParamType<T> &
  ((options: TOptions) => ParamType<T>);

interface Validator<T> {
  (value: T): boolean;
}

function isValid<T>(value: T, validators: Validator<T>[]) {
  for (const validator of validators) {
    if (!validator(value)) {
      return false;
    }
  }
  return true;
}

interface StringParamOptions {
  validators: Validator<string>[];
}

function createStringParam({
  validators,
}: StringParamOptions): ParamType<string> {
  return {
    format(value: string) {
      return isValid(value, validators)
        ? { valid: true, value }
        : { valid: false };
    },
    parse(value: string) {
      return isValid(value, validators)
        ? { valid: true, value }
        : { valid: false };
    },
  };
}

export const StringParam: ParamTypeFactory<string, StringParamOptions> =
  Object.assign(createStringParam, createStringParam({ validators: [] }));

interface NumberParamOptions {
  validators: Validator<number>[];
}

function createNumberParam({
  validators,
}: NumberParamOptions): ParamType<number> {
  return {
    format(value: number) {
      return isValid(value, validators)
        ? { valid: true, value: String(value) }
        : { valid: false };
    },
    parse(stringValue: string) {
      const value = Number.parseFloat(stringValue);
      return !isNaN(value) && isValid(value, validators)
        ? { valid: true, value }
        : { valid: false };
    },
  };
}

export const NumberParam: ParamTypeFactory<number, NumberParamOptions> =
  Object.assign(createNumberParam, createNumberParam({ validators: [] }));

interface BooleanParamOptions {
  trueValue?: string;
  falseValue?: string;
}

function createBooleanParam({
  trueValue = 'true',
  falseValue = 'false',
}: BooleanParamOptions): ParamType<boolean> {
  return {
    format(value: boolean) {
      return { valid: true, value: value ? trueValue : falseValue };
    },
    parse(stringValue: string) {
      switch (stringValue) {
        case trueValue:
          return { valid: true, value: true };
        case falseValue:
          return { valid: true, value: false };
        default:
          return { valid: false };
      }
    },
  };
}

export const BooleanParam: ParamTypeFactory<boolean, BooleanParamOptions> =
  Object.assign(createBooleanParam, createBooleanParam({}));

type PathParam<T> = ParamType<T>;

type PathSegments<TPath extends string> = TPath extends ''
  ? never
  : TPath extends `${infer THead}/${infer TTail}`
  ? (THead extends '' ? never : THead) | PathSegments<TTail>
  : TPath;

type PathParamName<TPathSegment> =
  TPathSegment extends `:${infer TPathParamName}` ? TPathParamName : never;

type PathParamNames<TPath extends string> = PathParamName<PathSegments<TPath>>;

type PathParams<TPath extends string> = {
  [name in PathParamNames<TPath>]: PathParam<unknown>;
};

type QueryParam<T> = ParamType<T>;

type QueryParams = {
  [name: string]: QueryParam<unknown>;
};

type CreateLocationPathParamOption<
  TPath extends string,
  TPathParams extends PathParams<TPath>
> = PathParamNames<TPath> extends never
  ? { pathParams?: undefined }
  : { pathParams: PathParamTypes<TPath, TPathParams> };

interface CreateLocationOptionsWithRequiredPathParams<
  TPath extends string,
  TPathParams extends PathParams<TPath>,
  TQueryParams extends QueryParams
> {
  pathParams: PathParamTypes<TPath, TPathParams>;
  queryParams?: QueryParamTypes<TQueryParams>;
  fragment?: string;
}

interface CreateLocationOptionsWithOptionalPathParams<
  TPath extends string,
  TPathParams extends PathParams<TPath>,
  TQueryParams extends QueryParams
> {
  pathParams?: PathParamTypes<TPath, TPathParams>;
  queryParams?: QueryParamTypes<TQueryParams>;
  fragment?: string;
}

interface Route<
  TPath extends string,
  TPathParams extends PathParams<TPath>,
  TQueryParams extends QueryParams
> {}

interface LocationRouteWithRequiredOptions<
  TPath extends string,
  TPathParams extends PathParams<TPath>,
  TQueryParams extends QueryParams
> extends Route<TPath, TPathParams, TQueryParams> {
  (
    options: CreateLocationOptionsWithRequiredPathParams<
      TPath,
      TPathParams,
      TQueryParams
    >
  ): Location;
}

interface LocationRouteWithOptionalOptions<
  TPath extends string,
  TPathParams extends PathParams<TPath>,
  TQueryParams extends QueryParams
> extends Route<TPath, TPathParams, TQueryParams> {
  (
    options?: CreateLocationOptionsWithOptionalPathParams<
      TPath,
      TPathParams,
      TQueryParams
    >
  ): Location;
}

type LocationRoute<
  TPath extends string,
  TPathParams extends PathParams<TPath>,
  TQueryParams extends QueryParams
> = PathParamNames<TPath> extends never
  ? LocationRouteWithOptionalOptions<TPath, TPathParams, TQueryParams>
  : LocationRouteWithRequiredOptions<TPath, TPathParams, TQueryParams>;

export interface CreateRouteParams<
  TPath extends string,
  TPathParams extends PathParams<TPath>,
  TQueryParams extends QueryParams
> {
  path: TPath;
  pathParams?: TPathParams;
  queryParams?: TQueryParams;
}

export function createRoute<
  TPath extends string,
  TPathParams extends PathParams<TPath>,
  TQueryParams extends QueryParams
>(
  params: CreateRouteParams<TPath, TPathParams, TQueryParams>
): Route<TPath, TPathParams, TQueryParams> {
  return undefined as any;
}

export function createLocationRoute<
  TPath extends string,
  TPathParams extends PathParams<TPath>,
  TQueryParams extends QueryParams
>(
  params: CreateRouteParams<TPath, TPathParams, TQueryParams>
): LocationRoute<TPath, TPathParams, TQueryParams> {
  return undefined as any;
}

type ExtractParamType<TPathParam extends ParamType<unknown>> =
  TPathParam extends ParamType<infer T> ? T : never;

type PathParamTypes<
  TPath extends string,
  TPathParams extends PathParams<TPath>
> = {
  [TPathParamName in PathParamNames<TPath>]: TPathParams[TPathParamName] extends object
    ? ExtractParamType<TPathParams[TPathParamName]>
    : string;
};

type QueryParamTypes<TQueryParams extends QueryParams> = {
  [TQueryParamName in keyof TQueryParams]: ExtractParamType<
    TQueryParams[TQueryParamName]
  >;
};

const route = createLocationRoute({
  path: 'asd/:zxc/qwe',
  pathParams: {
    zxc: NumberParam,
  },
  queryParams: {
    asd: StringParam,
  },
});

route({ queryParams: { asd: '123' } });
