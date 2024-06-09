import {
  AnySelector,
  createSelectorContext,
  findExecutionResultInArray,
  SelectorContext,
  SelectorExecutionResultsMap,
} from './selector';

export interface SelectorRunner<TState, TResult, TArgs extends any[]> {
  run(state: TState, ...args: TArgs): TResult;
  dispose(): void;
}

export interface SelectorActivationCallback<
  TState,
  TArgs extends any[] = any[]
> {
  (selector: AnySelector<TState, any, TArgs>, args: TArgs): void;
}

export interface CreateSelectorRunnerOptions<TState> {
  onActivate: SelectorActivationCallback<TState>;
  onDeactivate: SelectorActivationCallback<TState>;
}

export function createSelectorRunner<TState, TResult, TArgs extends any[]>(
  selector: AnySelector<TState, TResult, TArgs>,
  options: CreateSelectorRunnerOptions<TState>
): SelectorRunner<TState, TResult, TArgs> {
  return new SelectorRunnerImpl(
    selector,
    options.onActivate,
    options.onDeactivate
  );
}

function runOnDiff<TState>(
  targetExecutionResultsMap: SelectorExecutionResultsMap<TState>,
  diffTargetExecutionResultsMap: SelectorExecutionResultsMap<TState>,
  run: SelectorActivationCallback<TState>
) {
  for (const [selector, targetResults] of targetExecutionResultsMap) {
    const diffTargetResults = diffTargetExecutionResultsMap.get(selector);
    if (diffTargetResults === undefined) {
      for (const targetResult of targetResults) {
        run(targetResult.selector, targetResult.args);
      }
    } else {
      for (const targetResult of targetResults) {
        if (
          findExecutionResultInArray(
            diffTargetResults,
            targetResult.selector,
            targetResult.args
          ) === undefined
        ) {
          run(targetResult.selector, targetResult.args);
        }
      }
    }
  }
}

function runOnAll<TState>(
  targetExecutionResultsMap: SelectorExecutionResultsMap<TState>,
  run: SelectorActivationCallback<TState>
) {
  for (const [, targetResults] of targetExecutionResultsMap) {
    for (const targetResult of targetResults) {
      run(targetResult.selector, targetResult.args);
    }
  }
}

class SelectorRunnerImpl<TState, TResult, TArgs extends any[]>
  implements SelectorRunner<TState, TResult, TArgs>
{
  private context: SelectorContext<TState> | undefined = undefined;

  constructor(
    private readonly selector: AnySelector<TState, TResult, TArgs>,
    private readonly onActivate: SelectorActivationCallback<TState> | undefined,
    private readonly onDeactivate:
      | SelectorActivationCallback<TState>
      | undefined
  ) {}

  run(state: TState, ...args: TArgs): TResult {
    const cachedExecutionResultsMap =
      this.context !== undefined
        ? this.context.getExecutionResultsMap()
        : undefined;
    const context = createSelectorContext(state, cachedExecutionResultsMap);
    const result = this.selector(context, ...args);
    this.context = context;

    if (this.onDeactivate !== undefined) {
      if (cachedExecutionResultsMap != undefined) {
        runOnDiff(
          cachedExecutionResultsMap,
          context.getExecutionResultsMap(),
          this.onDeactivate
        );
      }
    }

    if (this.onActivate !== undefined) {
      if (cachedExecutionResultsMap != undefined) {
        runOnDiff(
          context.getExecutionResultsMap(),
          cachedExecutionResultsMap,
          this.onActivate
        );
      } else {
        runOnAll(context.getExecutionResultsMap(), this.onActivate);
      }
    }

    return result;
  }

  dispose() {
    if (this.onDeactivate !== undefined) {
      if (this.context !== undefined) {
        runOnAll(this.context.getExecutionResultsMap(), this.onDeactivate);
      }
    }
  }
}
