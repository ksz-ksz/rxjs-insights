import { ParamType, ParamTypeFactory } from '../param-type';

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

export interface BooleanParamOptions {
  trueValue?: string;
  falseValue?: string;
}

export const BooleanParam: ParamTypeFactory<boolean, BooleanParamOptions> =
  Object.assign(createBooleanParam, createBooleanParam({}));
