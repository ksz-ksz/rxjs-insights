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
  refs: unknown[];
  executionResult: SelectorExecutionResult<TState, TResult, TArgs>;
}

interface Cache<TState>
  extends Map<AnySelector<TState, any, any[]>, CacheEntry<TState>[]> {
  get<TResult, TArgs extends any[]>(
    selector: AnySelector<TState, TResult, TArgs>
  ): CacheEntry<TState, TResult, TArgs>[] | undefined;

  set<TResult, TArgs extends any[]>(
    selector: AnySelector<TState, TResult, TArgs>,
    executionResults: CacheEntry<TState, TResult, TArgs>[]
  ): this;
}

export interface SelectorExecutionResultsSharedCache<TState>
  extends SelectorExecutionResultsCache<TState> {
  addExecutionResult(
    ref: unknown,
    executionResult: SelectorExecutionResult<TState>
  ): void;

  removeExecutionResult(
    ref: unknown,
    executionResult: SelectorExecutionResult<TState>
  ): void;
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

  addExecutionResult(
    ref: unknown,
    executionResult: SelectorExecutionResult<TState>
  ) {
    const cacheEntries = this.cache.get(executionResult.selector);

    if (cacheEntries !== undefined) {
      const cacheEntry = this.getCacheEntryFromArray(
        cacheEntries,
        executionResult
      );

      if (cacheEntry !== undefined) {
        cacheEntry.refs.push(ref);
      } else {
        cacheEntries.push({
          refs: [ref],
          executionResult,
        });
      }
    } else {
      this.cache.set(executionResult.selector, [
        {
          refs: [ref],
          executionResult,
        },
      ]);
    }
  }

  removeExecutionResult(
    ref: unknown,
    executionResult: SelectorExecutionResult<TState>
  ) {
    const cacheEntries = this.cache.get(executionResult.selector);

    if (cacheEntries !== undefined) {
      const cacheEntry = this.getCacheEntryFromArray(
        cacheEntries,
        executionResult
      );

      if (cacheEntry !== undefined) {
        const indexOfRef = cacheEntry.refs.indexOf(ref);
        if (indexOfRef !== -1) {
          cacheEntry.refs.splice(indexOfRef, 1);
          if (cacheEntry.refs.length === 0) {
            const indexOfCacheEntry = cacheEntries.indexOf(cacheEntry);
            cacheEntries.splice(indexOfCacheEntry, 1);
            if (cacheEntries.length === 0) {
              this.cache.delete(executionResult.selector);
            }
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
