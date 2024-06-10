import { Selector, SelectorContext } from './selector';
import { SelectorExecutionResult } from './selector-execution-result';

export interface SelectorExecutionResultsCache<TState> {
  getExecutionResult<TResult, TArgs extends any[]>(
    context: SelectorContext<TState>,
    selector: Selector<TState, TResult, TArgs>,
    args: TArgs
  ): SelectorExecutionResult<TState, TResult, TArgs> | undefined;
}
