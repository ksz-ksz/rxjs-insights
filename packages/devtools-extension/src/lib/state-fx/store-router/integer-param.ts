import { isParamValueValid, ParamValidator } from './param-validator';
import { ParamType, ParamTypeFactory } from './param-type';

function createIntegerParam({
  validators,
}: IntegerParamOptions): ParamType<number> {
  return {
    format(value: number) {
      return Number.isInteger(value) && isParamValueValid(value, validators)
        ? { valid: true, value: String(value) }
        : { valid: false };
    },
    parse(stringValue: string) {
      const value = Number.parseInt(stringValue);
      return !isNaN(value) && isParamValueValid(value, validators)
        ? { valid: true, value }
        : { valid: false };
    },
  };
}

export interface IntegerParamOptions {
  validators: ParamValidator<number>[];
}

export const IntegerParam: ParamTypeFactory<number, IntegerParamOptions> =
  Object.assign(createIntegerParam, createIntegerParam({ validators: [] }));
