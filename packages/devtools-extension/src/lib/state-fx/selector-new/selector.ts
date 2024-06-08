export interface SelectorOptions {}

export interface SelectorContext<TState> {
  runSelector<TResult, TArgs extends any[]>(
    selector: Selector<TState, TResult, TArgs>,
    args: TArgs
  ): SelectorExecutionResult<TState, TResult, TArgs>;
  runStateSelector<TResult, TArgs extends any[]>(
    selector: StateSelector<TState, TResult, TArgs>,
    args: TArgs
  ): SelectorExecutionResult<TState, TResult, TArgs>;
  getExecutionResultsMap(): SelectorExecutionResultsMap<TState>;
}

export interface SelectorMetadata<TState, TResult, TArgs extends any[]> {
  run: RunSelector<TState, TResult, TArgs>;
  options: SelectorOptions;
}

export interface StateSelectorMetadata<TState, TResult, TArgs extends any[]> {
  run: RunStateSelector<TState, TResult, TArgs>;
  options: SelectorOptions;
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

export function createSelector<TState, TResult, TArgs extends any[]>(
  run: RunSelector<TState, TResult, TArgs>,
  options: SelectorOptions = {}
): Selector<TState, TResult, TArgs> {
  const meta: SelectorMetadata<TState, TResult, TArgs> = {
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
  options: SelectorOptions = {}
): StateSelector<TState, TResult, TArgs> {
  const meta: StateSelectorMetadata<TState, TResult, TArgs> = {
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

export type CurrentInputs<TState> = SelectorInput<TState>[] & {
  push<TResult, TArgs extends any[]>(
    input: SelectorInput<TState, TResult, TArgs>
  ): void;
};

export function areArgsEqual(args1: any[], args2: any[]) {
  const n = Math.max(args1.length, args2.length);
  for (let i = 0; i < n; i++) {
    const arg1 = args1[i];
    const arg2 = args2[i];
    if (arg1 !== arg2) {
      return false;
    }
  }
  return true;
}

export function findExecutionResult<TState, TResult, TArgs extends any[]>(
  executionResultsMap: SelectorExecutionResultsMap<TState>,
  selector: AnySelector<TState, TResult, TArgs>,
  args: TArgs
): SelectorExecutionResult<TState, TResult, TArgs> | undefined {
  const executionResults = executionResultsMap.get(selector);

  if (executionResults !== undefined) {
    for (const executionResult of executionResults) {
      if (areArgsEqual(executionResult.args, args)) {
        return executionResult;
      }
    }
  }

  return undefined;
}

export function addExecutionResult<TState, TResult, TArgs extends any[]>(
  executionResultsMap: SelectorExecutionResultsMap<TState>,
  executionResult: SelectorExecutionResult<TState, TResult, TArgs>
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
      if (this.currentInputs !== undefined) {
        this.currentInputs.push({
          selector: currentExecutionResult.selector,
          args: currentExecutionResult.args,
          result: currentExecutionResult.result,
        });
      }
      return currentExecutionResult;
    }

    if (this.cachedExecutionResultsMap !== undefined) {
      const cachedExecutionResult = findExecutionResult(
        this.cachedExecutionResultsMap,
        selector,
        args
      );
      if (cachedExecutionResult !== undefined) {
        const executionResult = this.getCachedSelectorExecutionResult(
          cachedExecutionResult
        );
        if (executionResult !== undefined) {
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

    const prevInputs = this.currentInputs;
    this.currentInputs = undefined;
    const result = selector.meta.run(this.state, ...args);
    this.currentInputs = prevInputs;
    const executionResult: SelectorExecutionResult<TState, TResult, TArgs> = {
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

  private getCachedSelectorExecutionResult<TResult, TArgs extends any[]>(
    executionResult: SelectorExecutionResult<TState, TResult, TArgs>
  ): SelectorExecutionResult<TState, TResult, TArgs> | undefined {
    const prevInputs = this.currentInputs;
    this.currentInputs = [];
    for (const input of executionResult.inputs) {
      const inputResult = input.selector(this, ...input.args);
      if (input.result !== inputResult) {
        this.currentInputs = prevInputs;
        return undefined;
      }
    }
    const inputs = this.currentInputs;
    this.currentInputs = prevInputs;

    return {
      selector: executionResult.selector,
      result: executionResult.result,
      args: executionResult.args,
      inputs,
    };
  }
}

export function createSelectorContext<TState>(
  state: TState,
  cachedExecutionResultsMap?: SelectorExecutionResultsMap<TState>
): SelectorContext<TState> {
  return new SelectorContextImpl(state, cachedExecutionResultsMap);
}
