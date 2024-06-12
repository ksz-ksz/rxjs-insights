import { findExecutionResult } from './find-execution-result';
import { SelectorExecutionResultsMap } from './selector-execution-results-map';
import {
  AnySelectorExecutionResult,
  SelectorExecutionResult,
  SelectorInput,
  StateSelectorExecutionResult,
} from './selector-execution-result';
import { SelectorExecutionResultsCache } from './selector-execution-results-cache';

export interface SelectorOptions {
  name?: string;
  share?: boolean;
}

export interface SelectorContext<TState> {
  runSelector<TResult, TArgs extends any[]>(
    selector: Selector<TState, TResult, TArgs>,
    args: TArgs
  ): SelectorExecutionResult<TState, TResult, TArgs>;
  runStateSelector<TResult, TArgs extends any[]>(
    selector: StateSelector<TState, TResult, TArgs>,
    args: TArgs
  ): StateSelectorExecutionResult<TState, TResult, TArgs>;
  getExecutionResultsMap(): SelectorExecutionResultsMap<TState>;
}

export interface SelectorMetadata<TState, TResult, TArgs extends any[]> {
  type: 'selector';
  run: RunSelector<TState, TResult, TArgs>;
  options: SelectorOptions;
}

export interface StateSelectorOptions {
  name?: string;
}

export interface StateSelectorMetadata<TState, TResult, TArgs extends any[]> {
  type: 'state-selector';
  run: RunStateSelector<TState, TResult, TArgs>;
  options: StateSelectorOptions;
}

export interface RunSelector<TState, TResult, TArgs extends any[]> {
  (context: SelectorContext<TState>, ...args: TArgs): TResult;
}

export interface SelectorBase<TState, TResult, TArgs extends any[]> {
  (context: SelectorContext<TState>, ...args: TArgs): TResult;
}

export interface Selector<TState, TResult, TArgs extends any[]>
  extends SelectorBase<TState, TResult, TArgs> {
  meta: SelectorMetadata<TState, TResult, TArgs>;
}

export interface RunStateSelector<TState, TResult, TArgs extends any[]> {
  (state: TState, ...args: TArgs): TResult;
}

export interface StateSelector<TState, TResult, TArgs extends any[]>
  extends SelectorBase<TState, TResult, TArgs> {
  meta: StateSelectorMetadata<TState, TResult, TArgs>;
}

export type AnySelector<TState, TResult, TArgs extends any[]> =
  | Selector<TState, TResult, TArgs>
  | StateSelector<TState, TResult, TArgs>;

export function createSelector<TState, TResult, TArgs extends any[]>(
  run: RunSelector<TState, TResult, TArgs>,
  options: SelectorOptions = {}
): Selector<TState, TResult, TArgs> {
  const meta: SelectorMetadata<TState, TResult, TArgs> = {
    type: 'selector',
    run,
    options,
  };
  const selector: Selector<TState, TResult, TArgs> = Object.assign(
    (context: SelectorContext<TState>, ...args: TArgs) => {
      const executionResult = context.runSelector(selector, args);
      return executionResult.result;
    },
    {
      meta,
    }
  );

  return selector;
}

export function createStateSelector<TState, TResult, TArgs extends any[]>(
  run: RunStateSelector<TState, TResult, TArgs>,
  options: StateSelectorOptions = {}
): StateSelector<TState, TResult, TArgs> {
  const meta: StateSelectorMetadata<TState, TResult, TArgs> = {
    type: 'state-selector',
    run,
    options,
  };
  const stateSelector: StateSelector<TState, TResult, TArgs> = Object.assign(
    (context: SelectorContext<TState>, ...args: TArgs) => {
      const executionResult = context.runStateSelector(stateSelector, args);
      return executionResult.result;
    },
    { meta }
  );

  return stateSelector;
}

export type CurrentInputs<TState> = SelectorInput<TState>[] & {
  push<TResult, TArgs extends any[]>(
    input: SelectorInput<TState, TResult, TArgs>
  ): void;
};

export function addExecutionResult<TState, TResult, TArgs extends any[]>(
  executionResultsMap: SelectorExecutionResultsMap<TState>,
  executionResult: AnySelectorExecutionResult<TState, TResult, TArgs>
) {
  const executionResults = executionResultsMap.get(executionResult.selector);
  if (executionResults !== undefined) {
    executionResults.push(executionResult);
  } else {
    executionResultsMap.set(executionResult.selector, [executionResult]);
  }
}

class SelectorContextImpl<TState> implements SelectorContext<TState> {
  private readonly currentExecutionResultsMap = new Map<
    Selector<TState, any, any>,
    SelectorExecutionResult<TState>[]
  >() as SelectorExecutionResultsMap<TState>;
  private currentInputs: CurrentInputs<TState> | undefined = undefined;
  constructor(
    private readonly state: TState,
    private readonly cache?: SelectorExecutionResultsCache<TState>
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
      if (this.currentInputs !== undefined) {
        this.currentInputs.push({
          selector: currentExecutionResult.selector,
          args: currentExecutionResult.args,
          result: currentExecutionResult.result,
        });
      }
      return currentExecutionResult;
    }

    if (this.cache !== undefined) {
      const prevInputs = this.currentInputs;
      this.currentInputs = undefined;
      const cachedExecutionResult = this.cache.getExecutionResult(
        this,
        selector,
        args
      );
      this.currentInputs = prevInputs;

      if (cachedExecutionResult !== undefined) {
        addExecutionResult(
          this.currentExecutionResultsMap,
          cachedExecutionResult
        );
        if (this.currentInputs !== undefined) {
          this.currentInputs.push({
            selector: cachedExecutionResult.selector,
            args: cachedExecutionResult.args,
            result: cachedExecutionResult.result,
          });
        }
        return cachedExecutionResult;
      }
    }

    const prevInputs = this.currentInputs;
    this.currentInputs = [];
    const result = selector.meta.run(this, ...args);
    const inputs = this.currentInputs!;
    this.currentInputs = prevInputs;
    const executionResult: SelectorExecutionResult<TState, TResult, TArgs> = {
      selector,
      result,
      args,
      inputs,
    };
    addExecutionResult(this.currentExecutionResultsMap, executionResult);
    if (this.currentInputs !== undefined) {
      this.currentInputs.push({
        selector: executionResult.selector,
        args: executionResult.args,
        result: executionResult.result,
      });
    }
    return executionResult;
  }

  runStateSelector<TResult, TArgs extends any[]>(
    selector: StateSelector<TState, TResult, TArgs>,
    args: TArgs
  ): StateSelectorExecutionResult<TState, TResult, TArgs> {
    const currentExecutionResult = findExecutionResult(
      this.currentExecutionResultsMap,
      selector,
      args
    );
    if (currentExecutionResult !== undefined) {
      if (this.currentInputs !== undefined) {
        this.currentInputs.push({
          selector: currentExecutionResult.selector,
          args: currentExecutionResult.args,
          result: currentExecutionResult.result,
        });
      }
      return currentExecutionResult;
    }

    const prevInputs = this.currentInputs;
    this.currentInputs = undefined;
    const result = selector.meta.run(this.state, ...args);
    this.currentInputs = prevInputs;
    const executionResult: StateSelectorExecutionResult<
      TState,
      TResult,
      TArgs
    > = {
      selector,
      result,
      args,
      inputs: [],
    };
    addExecutionResult(this.currentExecutionResultsMap, executionResult);
    if (this.currentInputs !== undefined) {
      this.currentInputs.push({
        selector: executionResult.selector,
        args: executionResult.args,
        result: executionResult.result,
      });
    }
    return executionResult;
  }

  getExecutionResultsMap() {
    return this.currentExecutionResultsMap;
  }
}

export function createSelectorContext<TState>(
  state: TState,
  cache?: SelectorExecutionResultsCache<TState>
): SelectorContext<TState> {
  return new SelectorContextImpl(state, cache);
}
