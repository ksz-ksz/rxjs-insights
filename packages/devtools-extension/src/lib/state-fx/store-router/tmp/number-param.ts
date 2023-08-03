import { isParamValueValid, ParamValidator } from './param-validator';
import { ParamType, ParamTypeFactory } from '../param-type';

function createNumberParam({
  validators,
}: NumberParamOptions): ParamType<number> {
  return {
    format(value: number) {
      return !isNaN(value) && isParamValueValid(value, validators)
        ? { valid: true, value: String(value) }
        : { valid: false };
    },
    parse(stringValue: string) {
      const value = Number.parseFloat(stringValue);
      return !isNaN(value) && isParamValueValid(value, validators)
        ? { valid: true, value }
        : { valid: false };
    },
  };
}

export interface NumberParamOptions {
  validators: ParamValidator<number>[];
}

export const NumberParam: ParamTypeFactory<number, NumberParamOptions> =
  Object.assign(createNumberParam, createNumberParam({ validators: [] }));
