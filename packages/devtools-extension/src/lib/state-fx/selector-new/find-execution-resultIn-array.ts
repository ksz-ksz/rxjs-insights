import { AnySelector } from './selector';
import { SelectorExecutionResult } from './selector-execution-result';
import { areArgsEqual } from './are-args-equal';

export function findExecutionResultInArray<
  TState,
  TResult,
  TArgs extends any[]
>(
  executionResults: SelectorExecutionResult<TState, TResult, TArgs>[],
  selector: AnySelector<TState, TResult, TArgs>,
  args: TArgs
) {
  for (const executionResult of executionResults) {
    if (areArgsEqual(executionResult.args, args)) {
      return executionResult;
    }
  }

  return undefined;
}
