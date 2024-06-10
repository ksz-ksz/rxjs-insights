import { createSelectorExecutionResultsGlobalCache } from './selector-execution-results-global-cache';
import { createSelector, createSelectorContext } from './selector';

describe('selector-execution-results-global-cache', () => {
  it('should add execution result to cache', () => {
    const listing: string[] = [];
    const selectSomething = createSelector(() => {
      listing.push('selectSomething.run');
      return 'something';
    });

    const cache = createSelectorExecutionResultsGlobalCache();
    cache.addExecutionResult('a', {
      selector: selectSomething,
      args: [],
      result: 'something',
      inputs: [],
    });

    const context = createSelectorContext(undefined, cache);
    const result = selectSomething(context);

    expect(listing).toMatchInlineSnapshot(`Array []`);
  });

  it('should remove execution result from cache', () => {
    const listing: string[] = [];
    const selectSomething = createSelector(() => {
      listing.push('selectSomething.run');
      return 'something';
    });

    const cache = createSelectorExecutionResultsGlobalCache();
    const executionResult = {
      selector: selectSomething,
      args: [],
      result: 'something',
      inputs: [],
    };
    cache.addExecutionResult('a', executionResult);
    cache.removeExecutionResult('a', executionResult);

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
    const selectSomething = createSelector(() => {
      listing.push('selectSomething.run');
      return 'something';
    });

    const cache = createSelectorExecutionResultsGlobalCache();
    const executionResult = {
      selector: selectSomething,
      args: [],
      result: 'something',
      inputs: [],
    };
    cache.addExecutionResult('a', executionResult);
    cache.addExecutionResult('b', executionResult);
    cache.removeExecutionResult('a', executionResult);

    const context = createSelectorContext(undefined, cache);
    const result = selectSomething(context);

    expect(listing).toMatchInlineSnapshot(`Array []`);
  });

  it('should remove execution result from cache when is used by every ref', () => {
    const listing: string[] = [];
    const selectSomething = createSelector(() => {
      listing.push('selectSomething.run');
      return 'something';
    });

    const cache = createSelectorExecutionResultsGlobalCache();
    const executionResult = {
      selector: selectSomething,
      args: [],
      result: 'something',
      inputs: [],
    };
    cache.addExecutionResult('a', executionResult);
    cache.addExecutionResult('b', executionResult);
    cache.removeExecutionResult('a', executionResult);
    cache.removeExecutionResult('b', executionResult);

    const context = createSelectorContext(undefined, cache);
    const result = selectSomething(context);

    expect(listing).toMatchInlineSnapshot(`
      Array [
        "selectSomething.run",
      ]
    `);
  });
});
