export interface SelectorOptions {}

export interface SelectorContext<TState> {
  run<TResult, TArgs extends any[]>(
    selector: Selector<TState, TResult, TArgs>,
    options: SelectorOptions,
    run: Selector<TState, TResult, TArgs>,
    args: TArgs
  ): TResult;
  runState<TResult, TArgs extends any[]>(
    selector: Selector<TState, TResult, TArgs>,
    options: SelectorOptions,
    run: StateSelector<TState, TResult, TArgs>,
    args: TArgs
  ): TResult;
  getExecutionResults(): any;
}

export interface Selector<TState, TResult, TArgs extends any[]> {
  (context: SelectorContext<TState>, ...args: TArgs): TResult;
}

export interface StateSelector<TState, TResult, TArgs extends any[]> {
  (state: TState, ...args: TArgs): TResult;
}

export function createSelector<TSelector extends Selector<any, any, any>>(
  run: TSelector,
  options: SelectorOptions = {}
): TSelector {
  const selector = ((context, ...args) => {
    return context.run(selector, options, run, args);
  }) as TSelector;

  return selector;
}

export function createStateSelector<TState, TResult, TArgs extends any[]>(
  run: StateSelector<TState, TResult, TArgs>,
  options: SelectorOptions = {}
) {
  const stateSelector: Selector<TState, TResult, TArgs> = (
    context,
    ...args
  ) => {
    return context.runState(stateSelector, options, run, args);
  };

  return stateSelector;
}

export interface SelectorExecutionResult<TState> {
  selector: Selector<TState, any, any>;
  state: TState;
  inputs: SelectorExecutionResult<TState>[];
  args: any[];
  result: any;
  hasRun: boolean;
}

function areArgsEqual(args1: any[], args2: any[]) {
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

function findExecutionResult<TState>(
  executionResultsMap: Map<
    Selector<TState, any, any>,
    SelectorExecutionResult<TState>[]
  >,
  selector: Selector<TState, any, any>,
  options: SelectorOptions,
  args: any[]
) {
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

function addExecutionResult<TState>(
  executionResultsMap: Map<
    Selector<TState, any, any>,
    SelectorExecutionResult<TState>[]
  >,
  executionResult: SelectorExecutionResult<TState>
) {
  const executionResults = executionResultsMap.get(executionResult.selector);
  if (executionResults !== undefined) {
    executionResults.push(executionResult);
  } else {
    executionResultsMap.set(executionResult.selector, [executionResult]);
  }
}

export function createSelectorContext<TState>(
  state: TState,
  cachedExecutionResultsMap: Map<
    Selector<TState, any, any>,
    SelectorExecutionResult<TState>[]
  > = new Map()
): SelectorContext<TState> {
  const currentExecutionResultsMap = new Map<
    Selector<TState, any, any>,
    SelectorExecutionResult<TState>[]
  >();
  let currentInputs: SelectorExecutionResult<TState>[] | undefined = undefined;

  function getCachedSelectorExecutionResult(
    context: SelectorContext<TState>,
    executionResult: SelectorExecutionResult<TState>
  ): SelectorExecutionResult<TState> | undefined {
    const prevInputs = currentInputs;
    currentInputs = [];
    for (let input of executionResult.inputs) {
      const inputResult = input.selector(context, ...input.args);
      if (input.result !== inputResult) {
        currentInputs = prevInputs;
        return undefined;
      }
    }
    const inputs = currentInputs;
    currentInputs = prevInputs;

    return {
      selector: executionResult.selector,
      result: executionResult.result,
      args: executionResult.args,
      inputs,
      state,
      hasRun: false,
    };
  }

  function getCachedStateSelectorExecutionResult(
    context: SelectorContext<TState>,
    executionResult: SelectorExecutionResult<TState>
  ): SelectorExecutionResult<TState> | undefined {
    if (executionResult.state !== state) {
      return undefined;
    }

    return {
      selector: executionResult.selector,
      result: executionResult.result,
      args: executionResult.args,
      inputs: [],
      state,
      hasRun: false,
    };
  }

  return {
    run<TResult, TArgs extends any[]>(
      selector: Selector<TState, TResult, TArgs>,
      options: SelectorOptions,
      run: Selector<TState, TResult, TArgs>,
      args: TArgs
    ): TResult {
      const currentExecutionResult = findExecutionResult(
        currentExecutionResultsMap,
        selector,
        options,
        args
      );
      if (currentExecutionResult !== undefined) {
        currentInputs?.push(currentExecutionResult);
        return currentExecutionResult.result;
      }

      const cachedExecutionResult = findExecutionResult(
        cachedExecutionResultsMap,
        selector,
        options,
        args
      );
      if (cachedExecutionResult !== undefined) {
        const executionResult = getCachedSelectorExecutionResult(
          this,
          cachedExecutionResult
        );
        if (executionResult !== undefined) {
          addExecutionResult(currentExecutionResultsMap, executionResult);
          currentInputs?.push(executionResult);
          return executionResult.result;
        }
      }

      const prevInputs = currentInputs;
      currentInputs = [];
      const result = run(this, ...args);
      const inputs = currentInputs!;
      currentInputs = prevInputs;
      const executionResult: SelectorExecutionResult<TState> = {
        selector,
        result,
        args,
        inputs,
        state,
        hasRun: true,
      };
      addExecutionResult(currentExecutionResultsMap, executionResult);
      currentInputs?.push(executionResult);
      return result;
    },
    runState<TResult, TArgs extends any[]>(
      selector: Selector<TState, TResult, TArgs>,
      options: SelectorOptions,
      run: StateSelector<TState, TResult, TArgs>,
      args: TArgs
    ): TResult {
      const currentExecutionResult = findExecutionResult(
        currentExecutionResultsMap,
        selector,
        options,
        args
      );
      if (currentExecutionResult !== undefined) {
        currentInputs?.push(currentExecutionResult);
        return currentExecutionResult.result;
      }

      const cachedExecutionResult = findExecutionResult(
        cachedExecutionResultsMap,
        selector,
        options,
        args
      );
      if (cachedExecutionResult !== undefined) {
        const executionResult = getCachedStateSelectorExecutionResult(
          this,
          cachedExecutionResult
        );
        if (executionResult !== undefined) {
          addExecutionResult(currentExecutionResultsMap, executionResult);
          currentInputs?.push(executionResult);
          return executionResult.result;
        }
      }

      const prevInputs = currentInputs;
      currentInputs = undefined;
      const result = run(state, ...args);
      currentInputs = prevInputs;
      const executionResult: SelectorExecutionResult<TState> = {
        selector,
        result,
        args,
        inputs: [],
        state,
        hasRun: true,
      };
      addExecutionResult(currentExecutionResultsMap, executionResult);
      currentInputs?.push(executionResult);
      return result;
    },
    getExecutionResults() {
      return currentExecutionResultsMap;
    },
  };
}
