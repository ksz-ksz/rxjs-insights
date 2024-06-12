import { AnySelector, Selector, StateSelector } from './selector';
import { findExecutionResultByArgs } from './find-execution-result-by-args';
import { SelectorExecutionResultsMap } from './selector-execution-results-map';
import {
  AnySelectorExecutionResult,
  SelectorExecutionResult,
  StateSelectorExecutionResult,
} from './selector-execution-result';

export function findExecutionResult<TState, TResult, TArgs extends any[]>(
  executionResultsMap: SelectorExecutionResultsMap<TState>,
  selector: Selector<TState, TResult, TArgs>,
  args: TArgs
): SelectorExecutionResult<TState, TResult, TArgs> | undefined;
export function findExecutionResult<TState, TResult, TArgs extends any[]>(
  executionResultsMap: SelectorExecutionResultsMap<TState>,
  selector: StateSelector<TState, TResult, TArgs>,
  args: TArgs
): StateSelectorExecutionResult<TState, TResult, TArgs> | undefined;
export function findExecutionResult<TState, TResult, TArgs extends any[]>(
  executionResultsMap: SelectorExecutionResultsMap<TState>,
  selector: AnySelector<TState, TResult, TArgs>,
  args: TArgs
): AnySelectorExecutionResult<TState, TResult, TArgs> | undefined;
export function findExecutionResult<TState, TResult, TArgs extends any[]>(
  executionResultsMap: SelectorExecutionResultsMap<TState>,
  selector: AnySelector<TState, TResult, TArgs>,
  args: TArgs
): AnySelectorExecutionResult<TState, TResult, TArgs> | undefined {
  const executionResults = executionResultsMap.get(selector);

  if (executionResults !== undefined) {
    const executionResult = findExecutionResultByArgs(executionResults, args);
    if (executionResult !== undefined) {
      return executionResult;
    }
  }

  return undefined;
}
