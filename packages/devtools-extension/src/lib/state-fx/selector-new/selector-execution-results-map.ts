import { AnySelector, Selector, StateSelector } from './selector';
import {
  AnySelectorExecutionResult,
  SelectorExecutionResult,
  StateSelectorExecutionResult,
} from './selector-execution-result';

export interface SelectorExecutionResultsMap<TState>
  extends Map<
    AnySelector<TState, any, any[]>,
    SelectorExecutionResult<TState>[]
  > {
  get<TResult, TArgs extends any[]>(
    selector: Selector<TState, TResult, TArgs>
  ): SelectorExecutionResult<TState, TResult, TArgs>[] | undefined;
  get<TResult, TArgs extends any[]>(
    selector: StateSelector<TState, TResult, TArgs>
  ): StateSelectorExecutionResult<TState, TResult, TArgs>[] | undefined;
  get<TResult, TArgs extends any[]>(
    selector: AnySelector<TState, TResult, TArgs>
  ): AnySelectorExecutionResult<TState, TResult, TArgs>[] | undefined;

  set<TResult, TArgs extends any[]>(
    selector: Selector<TState, TResult, TArgs>,
    executionResults: SelectorExecutionResult<TState, TResult, TArgs>[]
  ): this;
  set<TResult, TArgs extends any[]>(
    selector: StateSelector<TState, TResult, TArgs>,
    executionResults: StateSelectorExecutionResult<TState, TResult, TArgs>[]
  ): this;
  set<TResult, TArgs extends any[]>(
    selector: AnySelector<TState, TResult, TArgs>,
    executionResults: AnySelectorExecutionResult<TState, TResult, TArgs>[]
  ): this;
}
