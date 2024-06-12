import { AnySelector, Selector, SelectorContext } from './selector';
import { SelectorExecutionResult } from './selector-execution-result';
import { areArgsEqual } from './are-args-equal';
import { areInputsEqual } from './are-inputs-equal';
import { SelectorExecutionResultsCache } from './selector-execution-results-cache';

export function createSelectorExecutionResultsSharedCache<
  TState
>(): SelectorExecutionResultsSharedCache<TState> {
  return new SelectorExecutionResultsSharedCacheImpl();
}

interface CacheEntry<TState, TResult = any, TArgs extends any[] = any[]> {
  refs: number;
  executionResult: SelectorExecutionResult<TState, TResult, TArgs>;
}

interface Cache<TState>
  extends Map<Selector<TState, any, any[]>, CacheEntry<TState>[]> {
  get<TResult, TArgs extends any[]>(
    selector: Selector<TState, TResult, TArgs>
  ): CacheEntry<TState, TResult, TArgs>[] | undefined;

  set<TResult, TArgs extends any[]>(
    selector: Selector<TState, TResult, TArgs>,
    executionResults: CacheEntry<TState, TResult, TArgs>[]
  ): this;
}

export interface SelectorExecutionResultsSharedCache<TState>
  extends SelectorExecutionResultsCache<TState> {
  addExecutionResult(executionResult: SelectorExecutionResult<TState>): void;

  removeExecutionResult(executionResult: SelectorExecutionResult<TState>): void;
}

export class SelectorExecutionResultsSharedCacheImpl<TState>
  implements SelectorExecutionResultsSharedCache<TState>
{
  private readonly cache: Cache<TState> = new Map();

  getExecutionResult<TResult, TArgs extends any[]>(
    context: SelectorContext<TState>,
    selector: Selector<TState, TResult, TArgs>,
    args: TArgs
  ): SelectorExecutionResult<TState, TResult, TArgs> | undefined {
    if (!selector.meta.options.share) {
      return undefined;
    }

    const cacheEntries = this.cache.get(selector);

    if (cacheEntries !== undefined) {
      const executionResult = this.getExecutionResultFromArray(
        cacheEntries,
        context,
        args
      );
      if (executionResult !== undefined) {
        return executionResult;
      }
    }

    return undefined;
  }

  addExecutionResult(executionResult: SelectorExecutionResult<TState>) {
    if (!executionResult.selector.meta.options.share) {
      return;
    }

    const cacheEntries = this.cache.get(executionResult.selector);

    if (cacheEntries !== undefined) {
      const cacheEntry = this.getCacheEntryFromArray(
        cacheEntries,
        executionResult
      );

      if (cacheEntry !== undefined) {
        cacheEntry.refs++;
      } else {
        cacheEntries.push({
          refs: 1,
          executionResult,
        });
      }
    } else {
      this.cache.set(executionResult.selector, [
        {
          refs: 1,
          executionResult,
        },
      ]);
    }
  }

  removeExecutionResult(executionResult: SelectorExecutionResult<TState>) {
    if (!executionResult.selector.meta.options.share) {
      return;
    }

    const cacheEntries = this.cache.get(executionResult.selector);

    if (cacheEntries !== undefined) {
      const cacheEntry = this.getCacheEntryFromArray(
        cacheEntries,
        executionResult
      );

      if (cacheEntry !== undefined) {
        cacheEntry.refs--;

        if (cacheEntry.refs === 0) {
          const indexOfCacheEntry = cacheEntries.indexOf(cacheEntry);
          cacheEntries.splice(indexOfCacheEntry, 1);
          if (cacheEntries.length === 0) {
            this.cache.delete(executionResult.selector);
          }
        }
      }
    }
  }

  private getExecutionResultFromArray<TState, TResult, TArgs extends any[]>(
    cacheEntries: CacheEntry<TState, TResult, TArgs>[],
    context: SelectorContext<TState>,
    args: TArgs
  ) {
    for (const { executionResult } of cacheEntries) {
      if (
        areArgsEqual(executionResult.args, args) &&
        areInputsEqual(executionResult.inputs, context)
      ) {
        return executionResult;
      }
    }

    return undefined;
  }

  private getCacheEntryFromArray<TState, TResult, TArgs extends any[]>(
    cacheEntries: CacheEntry<TState, TResult, TArgs>[],
    executionResult: SelectorExecutionResult<TState, TResult, TArgs>
  ) {
    for (const cacheEntry of cacheEntries) {
      if (cacheEntry.executionResult === executionResult) {
        return cacheEntry;
      }
    }

    return undefined;
  }
}
