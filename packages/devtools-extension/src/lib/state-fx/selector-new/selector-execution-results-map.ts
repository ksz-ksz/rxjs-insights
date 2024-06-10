import { AnySelector } from './selector';
import { SelectorExecutionResult } from './selector-execution-result';

export interface SelectorExecutionResultsMap<TState>
  extends Map<
    AnySelector<TState, any, any[]>,
    SelectorExecutionResult<TState>[]
  > {
  get<TResult, TArgs extends any[]>(
    selector: AnySelector<TState, TResult, TArgs>
  ): SelectorExecutionResult<TState, TResult, TArgs>[] | undefined;

  set<TResult, TArgs extends any[]>(
    selector: AnySelector<TState, TResult, TArgs>,
    executionResults: SelectorExecutionResult<TState, TResult, TArgs>[]
  ): this;
}
