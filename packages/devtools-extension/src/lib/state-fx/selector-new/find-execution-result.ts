import { AnySelector } from './selector';
import { findExecutionResultInArray } from './find-execution-resultIn-array';
import { SelectorExecutionResultsMap } from './selector-execution-results-map';
import { SelectorExecutionResult } from './selector-execution-result';

export function findExecutionResult<TState, TResult, TArgs extends any[]>(
  executionResultsMap: SelectorExecutionResultsMap<TState>,
  selector: AnySelector<TState, TResult, TArgs>,
  args: TArgs
): SelectorExecutionResult<TState, TResult, TArgs> | undefined {
  const executionResults = executionResultsMap.get(selector);

  if (executionResults !== undefined) {
    const executionResult = findExecutionResultInArray(
      executionResults,
      selector,
      args
    );
    if (executionResult !== undefined) {
      return executionResult;
    }
  }

  return undefined;
}
