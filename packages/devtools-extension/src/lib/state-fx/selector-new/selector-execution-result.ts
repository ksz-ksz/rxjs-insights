import { AnySelector } from './selector';

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
  selector: AnySelector<TState, TResult, TArgs>;
  args: TArgs;
  result: TResult;
  inputs: SelectorInput<TState>[];
}