import {
  addExecutionResult,
  CurrentInputs,
  Selector,
  SelectorContext,
  StateSelector,
} from './selector';
import { findExecutionResult } from './find-execution-result';
import { SelectorExecutionResultsMap } from './selector-execution-results-map';
import {
  SelectorExecutionResult,
  StateSelectorExecutionResult,
} from './selector-execution-result';

export class TestSelectorContext<TState> implements SelectorContext<TState> {
  private readonly currentExecutionResultsMap: SelectorExecutionResultsMap<TState> =
    new Map();
  private currentInputs: CurrentInputs<TState> | undefined = undefined;

  constructor(
    private readonly state: TState,
    private readonly cachedExecutionResultsMap?: SelectorExecutionResultsMap<TState>
  ) {}

  runSelector<TResult, TArgs extends any[]>(
    selector: Selector<TState, TResult, TArgs>,
    args: TArgs
  ): SelectorExecutionResult<TState, TResult, TArgs> {
    const currentExecutionResult = findExecutionResult(
      this.currentExecutionResultsMap,
      selector,
      args
    );

    if (currentExecutionResult !== undefined) {
      this.currentInputs?.push(currentExecutionResult);
      return currentExecutionResult;
    }

    const prevInputs = this.currentInputs;
    this.currentInputs = [];
    const result = selector.meta.run(this, ...args);
    const inputs = this.currentInputs;
    this.currentInputs = prevInputs;

    const executionResult: SelectorExecutionResult<TState, TResult, TArgs> = {
      selector,
      args,
      result,
      inputs,
    };

    this.currentInputs?.push(executionResult);
    addExecutionResult(this.currentExecutionResultsMap, executionResult);
    return executionResult;
  }

  runStateSelector<TResult, TArgs extends any[]>(
    selector: StateSelector<TState, TResult, TArgs>,
    args: TArgs
  ): StateSelectorExecutionResult<TState, TResult, TArgs> {
    const result = selector.meta.run(this.state, ...args);

    const executionResult: StateSelectorExecutionResult<
      TState,
      TResult,
      TArgs
    > = {
      selector,
      args,
      result,
      inputs: [],
    };

    this.currentInputs?.push(executionResult);
    addExecutionResult(this.currentExecutionResultsMap, executionResult);
    return executionResult;
  }

  getExecutionResultsMap(): SelectorExecutionResultsMap<TState> {
    return this.currentExecutionResultsMap;
  }

  private shouldRun<TResult, TArgs extends any[]>(
    selector: Selector<TState, TResult, TArgs>,
    args: TArgs,
    inputs: CurrentInputs<TState>
  ) {
    if (this.cachedExecutionResultsMap === undefined) {
      return true;
    }
    const cachedExecutionResult = findExecutionResult(
      this.cachedExecutionResultsMap,
      selector,
      args
    );
    if (cachedExecutionResult === undefined) {
      return true;
    }

    for (const input of inputs) {
      const cachedExecutionResult = findExecutionResult(
        this.cachedExecutionResultsMap,
        input.selector,
        input.args
      );
      if (cachedExecutionResult === undefined) {
        return true;
      }
      if (cachedExecutionResult.result !== input.result) {
        return true;
      }
    }

    return false;
  }
}
