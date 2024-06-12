import { AnySelectorExecutionResult } from './selector-execution-result';
import { areArgsEqual } from './are-args-equal';

export function findExecutionResultByArgs<TState, TResult, TArgs extends any[]>(
  executionResults: AnySelectorExecutionResult<TState, TResult, TArgs>[],
  args: TArgs
): AnySelectorExecutionResult<TState, TResult, TArgs> | undefined {
  for (const executionResult of executionResults) {
    if (areArgsEqual(executionResult.args, args)) {
      return executionResult;
    }
  }

  return undefined;
}
