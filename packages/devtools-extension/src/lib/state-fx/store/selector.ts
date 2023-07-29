export interface SelectorState<STATE, ARGS extends any[] = any[], RESULT = any> {
  selector: Selector<STATE, ARGS, RESULT>;
  lastArgs: ARGS;
  lastState: STATE;
  lastInputs: SelectorInput<STATE>[];
  lastResult: RESULT;
}

interface SelectorInput<STATE, ARGS extends any[] = any[], RESULT = any> {
  lastResult: RESULT;
  selectorState: SelectorState<STATE, ARGS, RESULT>;
}

export interface SelectorContext<STATE> {
  state: STATE;
  selectors: Map<Selector<any, any, any>, SelectorState<any>>;
  inputs: undefined | SelectorInput<any>[];
}

export interface SelectorFunction<STATE, ARGS extends any[], RESULT> {
  (context: SelectorContext<STATE>, ...args: ARGS): RESULT;
}

export interface StateSelectorFunction<STATE, ARGS extends any[], RESULT> {
  (state: STATE, ...args: ARGS): RESULT;
}

export interface Selector<STATE, ARGS extends any[], RESULT> extends SelectorFunction<STATE, ARGS, RESULT> {}

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

function hasInputsChanged<STATE>(context: SelectorContext<STATE>, lastState: STATE, lastInputs: SelectorInput<STATE>[]) {
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
    const result = lastArgs.length === 0 ? selector(context) : selector(context, ...lastArgs);
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

export interface CreateSelectorOptions {
  scope?: 'local' | 'global';
}

function createSelectorWithArgs<STATE, ARGS extends any[], RESULT>(
  fn: SelectorFunction<STATE, ARGS, RESULT>,
  options: CreateSelectorOptions = {}
): Selector<STATE, ARGS, RESULT> {
  const hasLocalScope = options.scope !== undefined ? options.scope === 'local' : true;
  let globalSelectorState: SelectorState<STATE, ARGS, RESULT> | undefined;
  return function selector(context: SelectorContext<STATE>, ...args: ARGS) {
    // console.group(`${fn.name}(${args.map((arg) => JSON.stringify(arg)).join(', ')})`);
    const parentInputs = context.inputs;
    let selectorState = hasLocalScope ? (context.selectors.get(selector) as unknown as SelectorState<STATE, ARGS, RESULT>) : globalSelectorState;
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
      if (hasArgsChanged(args, lastArgs) || hasInputsChanged(context, lastState, lastInputs)) {
        context.inputs = [];
        // console.group(`run`);
        // @ts-ignore
        result = args.length === 0 ? fn(context) : fn(context, ...args);
        // console.groupEnd();
        selectorState.lastResult = result;
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
    parentInputs?.push({ selectorState: selectorState as any, lastResult: result });
    return result;
  };
}

function createSelectorWithoutArgs<STATE, RESULT>(fn: SelectorFunction<STATE, [], RESULT>, options: CreateSelectorOptions = {}): Selector<STATE, [], RESULT> {
  const hasLocalScope = options.scope !== undefined ? options.scope === 'local' : false;
  let globalSelectorState: SelectorState<STATE, [], RESULT> | undefined;
  return function selector(context: SelectorContext<STATE>) {
    // console.group(`${fn.name}()`);
    const parentInputs = context.inputs;
    let selectorState = hasLocalScope ? (context.selectors.get(selector) as unknown as SelectorState<STATE, [], RESULT>) : globalSelectorState;
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
        selectorState.lastResult = result;
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
    parentInputs?.push({ selectorState: selectorState as any, lastResult: result });
    return result;
  };
}

export function createSelector<STATE, ARGS extends any[], RESULT>(
  fn: SelectorFunction<STATE, ARGS, RESULT>,
  options: CreateSelectorOptions = {}
): Selector<STATE, ARGS, RESULT> {
  // @ts-ignore
  return fn.length > 1 ? createSelectorWithArgs(fn, options) : createSelectorWithoutArgs(fn, options);
}

function createStateSelectorWithArgs<STATE, ARGS extends any[], RESULT>(
  fn: StateSelectorFunction<STATE, ARGS, RESULT>,
  options: CreateSelectorOptions = {}
): Selector<STATE, ARGS, RESULT> {
  const hasLocalScope = options.scope !== undefined ? options.scope === 'local' : true;
  let globalSelectorState: SelectorState<STATE, ARGS, RESULT> | undefined;

  return function stateSelector(context: SelectorContext<STATE>, ...args: ARGS) {
    // console.group(`${fn.name}(${args.map((arg) => JSON.stringify(arg)).join(', ')})`);

    let selectorState = hasLocalScope ? context.selectors.get(stateSelector) : globalSelectorState;
    const parentInputs = context.inputs;
    // @ts-ignore
    let result: RESULT;
    if (selectorState === undefined) {
      // console.log('initial state');
      // @ts-ignore
      result = args.length === 0 ? fn(context.state) : fn(context.state, ...args);
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
        // @ts-ignore
        result = args.length === 0 ? fn(context.state) : fn(context.state, ...args);
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
  options: CreateSelectorOptions = {}
): Selector<STATE, [], RESULT> {
  const hasLocalScope = options.scope !== undefined ? options.scope === 'local' : false;
  let globalSelectorState: SelectorState<STATE, [], RESULT> | undefined;

  return function stateSelector(context: SelectorContext<STATE>) {
    // console.group(`${fn.name}()`);

    let selectorState = hasLocalScope ? context.selectors.get(stateSelector) : globalSelectorState;
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
  options: CreateSelectorOptions = {}
): Selector<STATE, ARGS, RESULT> {
  // @ts-ignore
  return fn.length > 1 ? createStateSelectorWithArgs(fn, options) : createStateSelectorWithoutArgs(fn, options);
}

export function createSelectorFunction<STATE, ARGS extends any[], RESULT>(selector: Selector<STATE, ARGS, RESULT>): StateSelectorFunction<STATE, ARGS, RESULT> {
  const context: SelectorContext<STATE> = {
    selectors: new Map(),
    inputs: undefined as any,
    state: undefined as any,
  };
  // @ts-ignore
  return function selectorFunction(state: STATE, ...args: ARGS) {
    context.state = state;
    return selector(context, ...args);
  };
}
