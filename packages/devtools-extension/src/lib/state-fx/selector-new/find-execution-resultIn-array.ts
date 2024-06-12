import { AnySelector } from './selector';
import {
  AnySelectorExecutionResult,
  SelectorExecutionResult,
} from './selector-execution-result';
import { areArgsEqual } from './are-args-equal';

export function findExecutionResultInArray<
  TState,
  TResult,
  TArgs extends any[]
>(
  executionResults: AnySelectorExecutionResult<TState, TResult, TArgs>[],
  selector: AnySelector<TState, TResult, TArgs>,
  args: TArgs
): AnySelectorExecutionResult<TState, TResult, TArgs> | undefined {
  for (const executionResult of executionResults) {
    if (areArgsEqual(executionResult.args, args)) {
      return executionResult;
    }
  }

  return undefined;
}
