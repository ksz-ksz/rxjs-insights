import { Selector, SelectorContext } from './selector';
import { SelectorExecutionResultsMap } from './selector-execution-results-map';
import { SelectorExecutionResult } from './selector-execution-result';
import { findExecutionResult } from './find-execution-result';

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
    const executionResult = findExecutionResult(
      this.executionResultsMap,
      selector,
      args
    );

    if (executionResult === undefined) {
      return undefined;
    }

    for (const input of executionResult.inputs) {
      const inputResult = input.selector(context, ...input.args);
      if (input.result !== inputResult) {
        return undefined;
      }
    }

    return executionResult;
  }
}
