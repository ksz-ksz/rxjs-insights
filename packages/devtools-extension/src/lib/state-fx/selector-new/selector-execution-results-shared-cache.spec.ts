import { createSelectorExecutionResultsSharedCache } from './selector-execution-results-shared-cache';
import { createSelector, createSelectorContext } from './selector';

describe('selector-execution-results-shared-cache', () => {
  it('should add execution result to cache', () => {
    const listing: string[] = [];
    const selectSomething = createSelector(
      () => {
        listing.push('selectSomething.run');
        return 'something';
      },
      {
        share: true,
      }
    );

    const cache = createSelectorExecutionResultsSharedCache();
    const executionResult = {
      selector: selectSomething,
      args: [],
      result: 'something',
      inputs: [],
    };
    cache.addExecutionResult(executionResult);

    const context = createSelectorContext(undefined, cache);
    const result = selectSomething(context);

    expect(listing).toMatchInlineSnapshot(`Array []`);
  });

  it('should remove execution result from cache', () => {
    const listing: string[] = [];
    const selectSomething = createSelector(
      () => {
        listing.push('selectSomething.run');
        return 'something';
      },
      {
        share: true,
      }
    );

    const cache = createSelectorExecutionResultsSharedCache();
    const executionResult = {
      selector: selectSomething,
      args: [],
      result: 'something',
      inputs: [],
    };
    cache.addExecutionResult(executionResult);
    cache.removeExecutionResult(executionResult);

    const context = createSelectorContext(undefined, cache);
    const result = selectSomething(context);

    expect(listing).toMatchInlineSnapshot(`
      Array [
        "selectSomething.run",
      ]
    `);
  });

  it('should not remove execution result from cache when is used by multiple refs', () => {
    const listing: string[] = [];
    const selectSomething = createSelector(
      () => {
        listing.push('selectSomething.run');
        return 'something';
      },
      {
        share: true,
      }
    );

    const cache = createSelectorExecutionResultsSharedCache();
    const executionResult = {
      selector: selectSomething,
      args: [],
      result: 'something',
      inputs: [],
    };
    cache.addExecutionResult(executionResult);
    cache.addExecutionResult(executionResult);
    cache.removeExecutionResult(executionResult);

    const context = createSelectorContext(undefined, cache);
    const result = selectSomething(context);

    expect(listing).toMatchInlineSnapshot(`Array []`);
  });

  it('should remove execution result from cache when is released by every ref', () => {
    const listing: string[] = [];
    const selectSomething = createSelector(
      () => {
        listing.push('selectSomething.run');
        return 'something';
      },
      {
        share: true,
      }
    );

    const cache = createSelectorExecutionResultsSharedCache();
    const executionResult = {
      selector: selectSomething,
      args: [],
      result: 'something',
      inputs: [],
    };
    cache.addExecutionResult(executionResult);
    cache.addExecutionResult(executionResult);
    cache.removeExecutionResult(executionResult);
    cache.removeExecutionResult(executionResult);

    const context = createSelectorContext(undefined, cache);
    const result = selectSomething(context);

    expect(listing).toMatchInlineSnapshot(`
      Array [
        "selectSomething.run",
      ]
    `);
  });

  it('should not add execution result to cache if it is not shared', () => {
    const listing: string[] = [];
    const selectSomething = createSelector(
      () => {
        listing.push('selectSomething.run');
        return 'something';
      },
      {
        share: false,
      }
    );

    const cache = createSelectorExecutionResultsSharedCache();
    const executionResult = {
      selector: selectSomething,
      args: [],
      result: 'something',
      inputs: [],
    };
    cache.addExecutionResult(executionResult);

    const context = createSelectorContext(undefined, cache);
    const result = selectSomething(context);

    expect(listing).toMatchInlineSnapshot(`
      Array [
        "selectSomething.run",
      ]
    `);
  });
});
