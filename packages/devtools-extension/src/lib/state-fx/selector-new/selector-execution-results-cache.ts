import { Selector, SelectorContext } from './selector';
import { SelectorExecutionResultsMap } from './selector-execution-results-map';
import {
  SelectorExecutionResult,
  SelectorInput,
} from './selector-execution-result';
import { areArgsEqual } from './are-args-equal';

export interface SelectorExecutionResultsCache<TState> {
  getExecutionResult<TResult, TArgs extends any[]>(
    context: SelectorContext<TState>,
    selector: Selector<TState, TResult, TArgs>,
    args: TArgs
  ): SelectorExecutionResult<TState, TResult, TArgs> | undefined;
}

export function createSelectorExecutionResultsCacheFromMap<TState>(
  executionResultsMap: SelectorExecutionResultsMap<TState>
) {
  return new SelectorExecutionResultsCacheFromMapImpl(executionResultsMap);
}

function areInputsEqual<TState>(
  inputs: SelectorInput<TState>[],
  context: SelectorContext<TState>
) {
  for (const input of inputs) {
    const inputResult = input.selector(context, ...input.args);
    if (input.result !== inputResult) {
      return false;
    }
  }
  return true;
}

export class SelectorExecutionResultsCacheFromMapImpl<TState>
  implements SelectorExecutionResultsCache<TState>
{
  constructor(
    private readonly executionResultsMap: SelectorExecutionResultsMap<TState>
  ) {}

  getExecutionResult<TResult, TArgs extends any[]>(
    context: SelectorContext<TState>,
    selector: Selector<TState, TResult, TArgs>,
    args: TArgs
  ): SelectorExecutionResult<TState, TResult, TArgs> | undefined {
    const executionResults = this.executionResultsMap.get(selector);

    if (executionResults !== undefined) {
      const executionResult = this.getExecutionResultFromArray(
        executionResults,
        context,
        args
      );
      if (executionResult !== undefined) {
        return executionResult;
      }
    }

    return undefined;
  }

  private getExecutionResultFromArray<TState, TResult, TArgs extends any[]>(
    executionResults: SelectorExecutionResult<TState, TResult, TArgs>[],
    context: SelectorContext<TState>,
    args: TArgs
  ) {
    for (const executionResult of executionResults) {
      if (
        areArgsEqual(executionResult.args, args) &&
        areInputsEqual(executionResult.inputs, context)
      ) {
        return executionResult;
      }
    }

    return undefined;
  }
}
