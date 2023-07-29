import { ParamType, ParamTypeFactory } from './param-type';
import { isParamValueValid, ParamValidator } from './param-validator';

function createStringParam({
  validators,
}: StringParamOptions): ParamType<string> {
  return {
    format(value: string) {
      return isParamValueValid(value, validators)
        ? { valid: true, value }
        : { valid: false };
    },
    parse(value: string) {
      return isParamValueValid(value, validators)
        ? { valid: true, value }
        : { valid: false };
    },
  };
}

export interface StringParamOptions {
  validators: ParamValidator<string>[];
}

export const StringParam: ParamTypeFactory<string, StringParamOptions> =
  Object.assign(createStringParam, createStringParam({ validators: [] }));
