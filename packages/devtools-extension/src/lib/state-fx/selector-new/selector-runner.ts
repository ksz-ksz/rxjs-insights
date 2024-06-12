import { AnySelector, createSelectorContext } from './selector';
import { findExecutionResultByArgs } from './find-execution-result-by-args';
import { SelectorExecutionResultsMap } from './selector-execution-results-map';
import { AnySelectorExecutionResult } from './selector-execution-result';

import { createSelectorExecutionResultsLocalCache } from './selector-execution-results-local-cache';
import { SelectorExecutionResultsSharedCache } from './selector-execution-results-shared-cache';
import { isSelectorExecutionResult } from './selector-guards';

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
  (result: AnySelectorExecutionResult<TState, TResult, TArgs>): void;
}

export interface CreateSelectorRunnerOptions<TState> {
  sharedCache?: SelectorExecutionResultsSharedCache<TState>;
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
    options.sharedCache,
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
          findExecutionResultByArgs(diffTargetResults, targetResult.args) ===
          undefined
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
  private executionResultsMap: SelectorExecutionResultsMap<TState> | undefined =
    undefined;

  private readonly executionResultAddedCallback:
    | SelectorExecutionResultCallback<TState>
    | undefined;
  private readonly executionResultRemovedCallback:
    | SelectorExecutionResultCallback<TState>
    | undefined;

  constructor(
    private readonly selector: AnySelector<TState, TResult, TArgs>,
    private readonly sharedCache:
      | SelectorExecutionResultsSharedCache<TState>
      | undefined,
    private readonly onSelectorActivated:
      | SelectorActivationCallback<TState>
      | undefined,
    private readonly onSelectorDeactivated:
      | SelectorActivationCallback<TState>
      | undefined,
    onExecutionResultAdded: SelectorExecutionResultCallback<TState> | undefined,
    onExecutionResultRemoved:
      | SelectorExecutionResultCallback<TState>
      | undefined
  ) {
    this.executionResultAddedCallback =
      this.sharedCache !== undefined || onExecutionResultAdded !== undefined
        ? (result) => {
            if (this.sharedCache !== undefined) {
              if (isSelectorExecutionResult(result)) {
                this.sharedCache.addExecutionResult(result);
              }
            }
            if (onExecutionResultAdded !== undefined) {
              onExecutionResultAdded(result);
            }
          }
        : undefined;

    this.executionResultRemovedCallback =
      this.sharedCache !== undefined || onExecutionResultRemoved !== undefined
        ? (result) => {
            if (this.sharedCache !== undefined) {
              if (isSelectorExecutionResult(result)) {
                this.sharedCache.removeExecutionResult(result);
              }
            }
            if (onExecutionResultRemoved !== undefined) {
              onExecutionResultRemoved(result);
            }
          }
        : undefined;
  }

  run(state: TState, ...args: TArgs): TResult {
    const prevExecutionResultsMap = this.executionResultsMap;
    const cache =
      prevExecutionResultsMap !== undefined
        ? createSelectorExecutionResultsLocalCache(
            prevExecutionResultsMap,
            this.sharedCache
          )
        : this.sharedCache;
    const context = createSelectorContext(state, cache);
    const result = this.selector(context, ...args);

    const executionResultsMap = context.getExecutionResultsMap();
    this.executionResultsMap = executionResultsMap;

    if (this.executionResultRemovedCallback !== undefined) {
      if (prevExecutionResultsMap != undefined) {
        runExecutionResultCallbackOnDiff(
          prevExecutionResultsMap,
          executionResultsMap,
          this.executionResultRemovedCallback
        );
      }
    }

    if (this.executionResultAddedCallback !== undefined) {
      if (prevExecutionResultsMap != undefined) {
        runExecutionResultCallbackOnDiff(
          executionResultsMap,
          prevExecutionResultsMap,
          this.executionResultAddedCallback
        );
      } else {
        runExecutionResultCallbackOnAll(
          executionResultsMap,
          this.executionResultAddedCallback
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
    if (this.executionResultsMap !== undefined) {
      if (this.executionResultRemovedCallback !== undefined) {
        runExecutionResultCallbackOnAll(
          this.executionResultsMap,
          this.executionResultRemovedCallback
        );
      }

      if (this.onSelectorDeactivated !== undefined) {
        runActivationCallbackOnAll(
          this.executionResultsMap,
          this.onSelectorDeactivated
        );
      }
    }
  }
}
