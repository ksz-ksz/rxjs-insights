import { AnySelector, Selector, StateSelector } from './selector';

export interface SelectorInput<
  TState,
  TResult = any,
  TArgs extends any[] = any[]
> {
  selector: AnySelector<TState, TResult, TArgs>;
  args: TArgs;
  result: TResult;
}

export interface SelectorExecutionResult<
  TState,
  TResult = any,
  TArgs extends any[] = any[]
> {
  selector: Selector<TState, TResult, TArgs>;
  args: TArgs;
  result: TResult;
  inputs: SelectorInput<TState>[];
}

export interface StateSelectorExecutionResult<
  TState,
  TResult = any,
  TArgs extends any[] = any[]
> {
  selector: StateSelector<TState, TResult, TArgs>;
  args: TArgs;
  result: TResult;
  inputs: SelectorInput<TState>[];
}

export type AnySelectorExecutionResult<
  TState,
  TResult = any,
  TArgs extends any[] = any[]
> =
  | SelectorExecutionResult<TState, TResult, TArgs>
  | StateSelectorExecutionResult<TState, TResult, TArgs>;
