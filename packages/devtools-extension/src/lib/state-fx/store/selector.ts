interface SelectorStateData<STATE, ARGS extends any[] = any[], RESULT = any> {
  selector: Selector<STATE, ARGS, RESULT>;
  lastArgs: ARGS;
  lastState: STATE;
  lastInputs: SelectorInputData<STATE>[];
  lastResult: RESULT;
}

interface SelectorInputData<STATE, ARGS extends any[] = any[], RESULT = any> {
  lastResult: RESULT;
  selectorState: SelectorStateData<STATE, ARGS, RESULT>;
}

export interface SelectorContext<STATE> {
  state: STATE;
  selectors: Map<Selector<any, any, any>, SelectorStateData<any>>;
  inputs: undefined | SelectorInputData<any>[];
}

export type SelectorStatesIntersection<T extends [...any]> = T extends [infer U]
  ? SelectorState<U>
  : T extends [infer THead, ...infer TTail]
  ? SelectorState<THead> & SelectorStatesIntersection<TTail>
  : never;

export type SelectorContextFromDeps<T extends any[]> = SelectorContext<
  SelectorStatesIntersection<T>
>;

export interface SelectorFunction<STATE, ARGS extends any[], RESULT> {
  (context: SelectorContext<STATE>, ...args: ARGS): RESULT;
}

export interface StateSelectorFunction<STATE, ARGS extends any[], RESULT> {
  (state: STATE, ...args: ARGS): RESULT;
}

export interface Selector<STATE, ARGS extends any[], RESULT>
  extends SelectorFunction<STATE, ARGS, RESULT> {}

function hasArgsChanged(args: any[], lastArgs: any[]) {
  if (lastArgs.length !== args.length) {
    return true;
  }
  const length = lastArgs.length;
  for (let i = 0; i < length; i++) {
    if (lastArgs[i] !== args[i]) {
      return true;
    }
  }
  return false;
}

function hasInputsChanged<STATE>(
  context: SelectorContext<STATE>,
  lastState: STATE,
  lastInputs: SelectorInputData<STATE>[]
) {
  if (lastState === context.state) {
    // console.log(`hasInputsChanged: false (state didn't change)`);
    return false;
  }
  // console.group('hasInputsChanged');
  let changed = false;
  const inputs = context.inputs;
  context.inputs = undefined;
  for (const input of lastInputs) {
    const {
      selectorState: { selector, lastArgs },
      lastResult,
    } = input;
    const result =
      lastArgs.length === 0
        ? selector(context)
        : selector(context, ...lastArgs);
    if (result !== lastResult) {
      changed = true;
      break;
    }
  }
  context.inputs = inputs;
  // console.log('result:', changed);
  // console.groupEnd();
  return changed;
}

export interface CreateSelectorOptions<RESULT> {
  scope?: 'local' | 'global';
  equals?: (a: RESULT, b: RESULT) => boolean;
}

function createSelectorWithArgs<STATE, ARGS extends any[], RESULT>(
  fn: SelectorFunction<STATE, ARGS, RESULT>,
  options: CreateSelectorOptions<RESULT> = {}
): Selector<STATE, ARGS, RESULT> {
  const hasLocalScope =
    options.scope !== undefined ? options.scope === 'local' : true;
  const equals = options.equals;
  let globalSelectorState: SelectorStateData<STATE, ARGS, RESULT> | undefined;
  return function selector(context: SelectorContext<STATE>, ...args: ARGS) {
    // console.group(`${fn.name}(${args.map((arg) => JSON.stringify(arg)).join(', ')})`);
    const parentInputs = context.inputs;
    let selectorState = hasLocalScope
      ? (context.selectors.get(selector) as unknown as SelectorStateData<
          STATE,
          ARGS,
          RESULT
        >)
      : globalSelectorState;
    let result: RESULT;
    if (selectorState === undefined) {
      // console.log('initial state');
      context.inputs = [];
      // console.group(`run`);
      // @ts-ignore
      result = args.length === 0 ? fn(context) : fn(context, ...args);
      // console.groupEnd();
      selectorState = {
        selector,
        lastArgs: args,
        lastState: context.state,
        lastInputs: context.inputs,
        lastResult: result,
      };
      if (hasLocalScope) {
        context.selectors.set(selector, selectorState as any);
      } else {
        globalSelectorState = selectorState;
      }
      context.inputs = parentInputs;
      // console.log(`result: ${JSON.stringify(result)}`);
      // console.groupEnd();
    } else {
      const { lastArgs, lastState, lastInputs } = selectorState;
      if (
        hasArgsChanged(args, lastArgs) ||
        hasInputsChanged(context, lastState, lastInputs)
      ) {
        context.inputs = [];
        // console.group(`run`);
        // @ts-ignore
        result = args.length === 0 ? fn(context) : fn(context, ...args);
        // console.groupEnd();
        selectorState.lastResult = equals
          ? equals(selectorState.lastResult, result)
            ? selectorState.lastResult
            : result
          : result;
        selectorState.lastState = context.state;
        selectorState.lastArgs = args;
        selectorState.lastInputs = context.inputs;
        context.inputs = parentInputs;
        // console.log(`result: ${JSON.stringify(result)}`);
        // console.groupEnd();
      } else {
        // console.log(`cache state`);
        // console.log(`result: ${JSON.stringify(selectorState.lastResult)}`);
        // console.groupEnd();
        result = selectorState.lastResult;
      }
    }
    parentInputs?.push({
      selectorState: selectorState as any,
      lastResult: result,
    });
    return result;
  };
}

function createSelectorWithoutArgs<STATE, RESULT>(
  fn: SelectorFunction<STATE, [], RESULT>,
  options: CreateSelectorOptions<RESULT> = {}
): Selector<STATE, [], RESULT> {
  const hasLocalScope =
    options.scope !== undefined ? options.scope === 'local' : false;
  const equals = options.equals;
  let globalSelectorState: SelectorStateData<STATE, [], RESULT> | undefined;
  return function selector(context: SelectorContext<STATE>) {
    // console.group(`${fn.name}()`);
    const parentInputs = context.inputs;
    let selectorState = hasLocalScope
      ? (context.selectors.get(selector) as unknown as SelectorStateData<
          STATE,
          [],
          RESULT
        >)
      : globalSelectorState;
    let result: RESULT;
    if (selectorState === undefined) {
      // console.log('initial state');
      context.inputs = [];
      // console.group(`run`);
      // @ts-ignore
      result = fn(context);
      // console.groupEnd();
      selectorState = {
        selector,
        lastArgs: [],
        lastState: context.state,
        lastInputs: context.inputs,
        lastResult: result,
      };
      if (hasLocalScope) {
        context.selectors.set(selector, selectorState as any);
      } else {
        globalSelectorState = selectorState;
      }
      context.inputs = parentInputs;
      // console.log(`result: ${JSON.stringify(result)}`);
      // console.groupEnd();
    } else {
      const { lastState, lastInputs } = selectorState;
      if (hasInputsChanged(context, lastState, lastInputs)) {
        context.inputs = [];
        // console.group(`run`);
        // @ts-ignore
        result = fn(context);
        // console.groupEnd();
        selectorState.lastResult = equals
          ? equals(selectorState.lastResult, result)
            ? selectorState.lastResult
            : result
          : result;
        selectorState.lastState = context.state;
        selectorState.lastInputs = context.inputs;
        context.inputs = parentInputs;
        // console.log(`result: ${JSON.stringify(result)}`);
        // console.groupEnd();
      } else {
        // console.log(`cache state`);
        // console.log(`result: ${JSON.stringify(selectorState.lastResult)}`);
        // console.groupEnd();
        result = selectorState.lastResult;
      }
    }
    parentInputs?.push({
      selectorState: selectorState as any,
      lastResult: result,
    });
    return result;
  };
}

export function createSelector<STATE, ARGS extends any[], RESULT>(
  fn: SelectorFunction<STATE, ARGS, RESULT>,
  options: CreateSelectorOptions<RESULT> = {}
): Selector<STATE, ARGS, RESULT> {
  return fn.length > 1
    ? (createSelectorWithArgs(fn as any, options) as any)
    : (createSelectorWithoutArgs(fn as any, options) as any);
}

function createStateSelectorWithArgs<STATE, ARGS extends any[], RESULT>(
  fn: StateSelectorFunction<STATE, ARGS, RESULT>,
  options: CreateSelectorOptions<RESULT> = {}
): Selector<STATE, ARGS, RESULT> {
  const hasLocalScope =
    options.scope !== undefined ? options.scope === 'local' : true;
  let globalSelectorState: SelectorStateData<STATE, ARGS, RESULT> | undefined;

  return function stateSelector(
    context: SelectorContext<STATE>,
    ...args: ARGS
  ) {
    // console.group(`${fn.name}(${args.map((arg) => JSON.stringify(arg)).join(', ')})`);

    let selectorState = hasLocalScope
      ? context.selectors.get(stateSelector)
      : globalSelectorState;
    const parentInputs = context.inputs;
    // @ts-ignore
    let result: RESULT;
    if (selectorState === undefined) {
      // console.log('initial state');
      result =
        args.length === 0
          ? (fn as any)(context.state)
          : fn(context.state, ...args);
      selectorState = {
        selector: stateSelector as any,
        lastArgs: args,
        lastState: context.state,
        lastInputs: [],
        lastResult: result,
      };
      if (hasLocalScope) {
        context.selectors.set(stateSelector, selectorState as any);
      } else {
        globalSelectorState = selectorState as any;
      }
    } else {
      const { lastArgs, lastState } = selectorState;
      if (hasArgsChanged(args, lastArgs) || context.state !== lastState) {
        // console.log('run');
        result =
          args.length === 0
            ? (fn as any)(context.state)
            : fn(context.state, ...args);
        selectorState.lastResult = result;
        selectorState.lastState = context.state;
        selectorState.lastArgs = args;
      } else {
        // console.log('from cache');
        result = selectorState.lastResult;
      }
    }
    parentInputs?.push({
      selectorState: selectorState as any,
      lastResult: result,
    });
    // console.log(`result: ${JSON.stringify(result)}`);
    // console.groupEnd();
    return result;
  };
}

function createStateSelectorWithoutArgs<STATE, RESULT>(
  fn: StateSelectorFunction<STATE, [], RESULT>,
  options: CreateSelectorOptions<RESULT> = {}
): Selector<STATE, [], RESULT> {
  const hasLocalScope =
    options.scope !== undefined ? options.scope === 'local' : false;
  let globalSelectorState: SelectorStateData<STATE, [], RESULT> | undefined;

  return function stateSelector(context: SelectorContext<STATE>) {
    // console.group(`${fn.name}()`);

    let selectorState = hasLocalScope
      ? context.selectors.get(stateSelector)
      : globalSelectorState;
    const parentInputs = context.inputs;
    // @ts-ignore
    let result: RESULT;
    if (selectorState === undefined) {
      // console.log('initial state');
      // @ts-ignore
      result = fn(context.state);
      selectorState = {
        selector: stateSelector as any,
        lastArgs: [],
        lastState: context.state,
        lastInputs: [],
        lastResult: result,
      };
      if (hasLocalScope) {
        context.selectors.set(stateSelector, selectorState as any);
      } else {
        globalSelectorState = selectorState as any;
      }
    } else {
      const { lastState } = selectorState;
      if (context.state !== lastState) {
        // console.log('run');
        // @ts-ignore
        result = fn(context.state);
        selectorState.lastResult = result;
        selectorState.lastState = context.state;
      } else {
        // console.log('from cache');
        result = selectorState.lastResult;
      }
    }
    parentInputs?.push({
      selectorState: selectorState as any,
      lastResult: result,
    });
    // console.log(`result: ${JSON.stringify(result)}`);
    // console.groupEnd();
    return result;
  };
}

export function createStateSelector<STATE, ARGS extends any[], RESULT>(
  fn: StateSelectorFunction<STATE, ARGS, RESULT>,
  options: CreateSelectorOptions<RESULT> = {}
): Selector<STATE, ARGS, RESULT> {
  return fn.length > 1
    ? (createStateSelectorWithArgs(fn as any, options) as any)
    : (createStateSelectorWithoutArgs(fn as any, options) as any);
}

export function createSelectorFunction<STATE, ARGS extends any[], RESULT>(
  selector: Selector<STATE, ARGS, RESULT>
): StateSelectorFunction<STATE, ARGS, RESULT> {
  const context: SelectorContext<STATE> = {
    selectors: new Map(),
    inputs: undefined as any,
    state: undefined as any,
  };
  return function selectorFunction(state: STATE, ...args: ARGS) {
    context.state = state;
    return selector(context, ...args);
  };
}

export type SelectorStateImpl<TSelector> = TSelector extends Selector<
  infer TState,
  any,
  any
>
  ? TState
  : never;

export type SelectorState<TSelector> = {
  [K in keyof SelectorStateImpl<TSelector>]: SelectorStateImpl<TSelector>[K];
};
