import {
  AnySelector,
  createSelectorContext,
  SelectorContext,
} from './selector';
import { findExecutionResultInArray } from './find-execution-resultIn-array';
import { SelectorExecutionResultsMap } from './selector-execution-results-map';
import { SelectorExecutionResult } from './selector-execution-result';
import { createSelectorExecutionResultsCacheFromMap } from './selector-execution-results-cache';

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

export interface SelectorExecutionResultCallback<
  TState,
  TResult = any,
  TArgs extends any[] = any[]
> {
  (result: SelectorExecutionResult<TState, TResult, TArgs>): void;
}

export interface CreateSelectorRunnerOptions<TState> {
  onSelectorActivated?: SelectorActivationCallback<TState>;
  onSelectorDeactivated?: SelectorActivationCallback<TState>;
  onExecutionResultAdded?: SelectorExecutionResultCallback<TState>;
  onExecutionResultRemoved?: SelectorExecutionResultCallback<TState>;
}

export function createSelectorRunner<TState, TResult, TArgs extends any[]>(
  selector: AnySelector<TState, TResult, TArgs>,
  options: CreateSelectorRunnerOptions<TState> = {}
): SelectorRunner<TState, TResult, TArgs> {
  return new SelectorRunnerImpl(
    selector,
    options.onSelectorActivated,
    options.onSelectorDeactivated,
    options.onExecutionResultAdded,
    options.onExecutionResultRemoved
  );
}

function runActivationCallbackOnDiff<TState>(
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

function runActivationCallbackOnAll<TState>(
  targetExecutionResultsMap: SelectorExecutionResultsMap<TState>,
  run: SelectorActivationCallback<TState>
) {
  for (const [, targetResults] of targetExecutionResultsMap) {
    for (const targetResult of targetResults) {
      run(targetResult.selector, targetResult.args);
    }
  }
}

function runExecutionResultCallbackOnDiff<TState>(
  targetExecutionResultsMap: SelectorExecutionResultsMap<TState>,
  diffTargetExecutionResultsMap: SelectorExecutionResultsMap<TState>,
  run: SelectorExecutionResultCallback<TState>
) {
  for (const [selector, targetResults] of targetExecutionResultsMap) {
    const diffTargetResults = diffTargetExecutionResultsMap.get(selector);
    if (diffTargetResults === undefined) {
      for (const targetResult of targetResults) {
        run(targetResult);
      }
    } else {
      for (const targetResult of targetResults) {
        if (!diffTargetResults.includes(targetResult)) {
          run(targetResult);
        }
      }
    }
  }
}

function runExecutionResultCallbackOnAll<TState>(
  targetExecutionResultsMap: SelectorExecutionResultsMap<TState>,
  run: SelectorExecutionResultCallback<TState>
) {
  for (const [, targetResults] of targetExecutionResultsMap) {
    for (const targetResult of targetResults) {
      run(targetResult);
    }
  }
}

class SelectorRunnerImpl<TState, TResult, TArgs extends any[]>
  implements SelectorRunner<TState, TResult, TArgs>
{
  private context: SelectorContext<TState> | undefined = undefined;

  constructor(
    private readonly selector: AnySelector<TState, TResult, TArgs>,
    private readonly onSelectorActivated:
      | SelectorActivationCallback<TState>
      | undefined,
    private readonly onSelectorDeactivated:
      | SelectorActivationCallback<TState>
      | undefined,
    private readonly onExecutionResultAdded:
      | SelectorExecutionResultCallback<TState>
      | undefined,
    private readonly onExecutionResultRemoved:
      | SelectorExecutionResultCallback<TState>
      | undefined
  ) {}

  run(state: TState, ...args: TArgs): TResult {
    const prevExecutionResultsMap =
      this.context !== undefined
        ? this.context.getExecutionResultsMap()
        : undefined;
    const cache =
      prevExecutionResultsMap !== undefined
        ? createSelectorExecutionResultsCacheFromMap(prevExecutionResultsMap)
        : undefined;
    const context = createSelectorContext(state, cache);
    const result = this.selector(context, ...args);
    this.context = context;

    const executionResultsMap = context.getExecutionResultsMap();

    if (this.onExecutionResultRemoved !== undefined) {
      if (prevExecutionResultsMap != undefined) {
        runExecutionResultCallbackOnDiff(
          prevExecutionResultsMap,
          executionResultsMap,
          this.onExecutionResultRemoved
        );
      }
    }

    if (this.onExecutionResultAdded !== undefined) {
      if (prevExecutionResultsMap != undefined) {
        runExecutionResultCallbackOnDiff(
          executionResultsMap,
          prevExecutionResultsMap,
          this.onExecutionResultAdded
        );
      } else {
        runExecutionResultCallbackOnAll(
          executionResultsMap,
          this.onExecutionResultAdded
        );
      }
    }

    if (this.onSelectorDeactivated !== undefined) {
      if (prevExecutionResultsMap != undefined) {
        runActivationCallbackOnDiff(
          prevExecutionResultsMap,
          executionResultsMap,
          this.onSelectorDeactivated
        );
      }
    }

    if (this.onSelectorActivated !== undefined) {
      if (prevExecutionResultsMap != undefined) {
        runActivationCallbackOnDiff(
          executionResultsMap,
          prevExecutionResultsMap,
          this.onSelectorActivated
        );
      } else {
        runActivationCallbackOnAll(
          executionResultsMap,
          this.onSelectorActivated
        );
      }
    }

    return result;
  }

  dispose() {
    if (this.context !== undefined) {
      if (this.onExecutionResultRemoved !== undefined) {
        runExecutionResultCallbackOnAll(
          this.context.getExecutionResultsMap(),
          this.onExecutionResultRemoved
        );
      }

      if (this.onSelectorDeactivated !== undefined) {
        runActivationCallbackOnAll(
          this.context.getExecutionResultsMap(),
          this.onSelectorDeactivated
        );
      }
    }
  }
}
