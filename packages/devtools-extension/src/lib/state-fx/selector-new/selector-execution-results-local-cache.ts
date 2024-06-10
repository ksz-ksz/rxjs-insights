import { SelectorExecutionResultsMap } from './selector-execution-results-map';
import { Selector, SelectorContext } from './selector';
import { SelectorExecutionResult } from './selector-execution-result';
import { areArgsEqual } from './are-args-equal';
import { areInputsEqual } from './are-inputs-equal';
import { SelectorExecutionResultsCache } from './selector-execution-results-cache';

export function createSelectorExecutionResultsLocalCache<TState>(
  executionResultsMap: SelectorExecutionResultsMap<TState>,
  parent?: SelectorExecutionResultsCache<TState>
): SelectorExecutionResultsCache<TState> {
  return new SelectorExecutionResultsLocalCacheImpl(
    executionResultsMap,
    parent
  );
}

class SelectorExecutionResultsLocalCacheImpl<TState>
  implements SelectorExecutionResultsCache<TState>
{
  constructor(
    private readonly executionResultsMap: SelectorExecutionResultsMap<TState>,
    private readonly parent: SelectorExecutionResultsCache<TState> | undefined
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

    if (this.parent !== undefined) {
      return this.parent.getExecutionResult(context, selector, args);
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
