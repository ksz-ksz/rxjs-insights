import {
  AnySelectorExecutionResult,
  SelectorExecutionResult,
  StateSelectorExecutionResult,
} from './selector-execution-result';
import { AnySelector, Selector, StateSelector } from './selector';

export function isSelector<TState, TResult, TArgs extends any[]>(
  selector: AnySelector<TState, TResult, TArgs>
): selector is Selector<TState, TResult, TArgs> {
  return selector.meta.type === 'selector';
}

export function isSelectorExecutionResult<TState, TResult, TArgs extends any[]>(
  executionResult: AnySelectorExecutionResult<TState, TResult, TArgs>
): executionResult is SelectorExecutionResult<TState, TResult, TArgs> {
  return isSelector(executionResult.selector);
}

export function isStateSelector<TState, TResult, TArgs extends any[]>(
  selector: AnySelector<TState, TResult, TArgs>
): selector is StateSelector<TState, TResult, TArgs> {
  return selector.meta.type === 'selector';
}

export function isStateSelectorExecutionResult<
  TState,
  TResult,
  TArgs extends any[]
>(
  executionResult: AnySelectorExecutionResult<TState, TResult, TArgs>
): executionResult is StateSelectorExecutionResult<TState, TResult, TArgs> {
  return isStateSelector(executionResult.selector);
}
