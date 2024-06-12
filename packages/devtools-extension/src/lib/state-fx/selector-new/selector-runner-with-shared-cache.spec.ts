import {
  createSelector,
  createStateSelector,
  RunSelector,
  RunStateSelector,
  Selector,
  SelectorContext,
  SelectorOptions,
  StateSelector,
} from './selector';
import { createSelectorRunner } from './selector-runner';
import {
  createSelectorExecutionResultsSharedCache,
  SelectorExecutionResultsSharedCache,
} from './selector-execution-results-shared-cache';
import { SelectorExecutionResult } from './selector-execution-result';

interface State {
  n: number;
  foo: string;
  bar: string;
}

describe('selector-runner', () => {
  const listing: string[] = [];

  beforeEach(() => {
    listing.length = 0;
  });

  function createTestStateSelector<TState, TResult, TArgs extends any[]>(
    run: RunStateSelector<TState, TResult, TArgs>,
    options: SelectorOptions = {}
  ): StateSelector<TState, TResult, TArgs> {
    return createStateSelector((state, ...args) => {
      listing.push(`${options.name} run ${JSON.stringify(args)}`);
      return run(state, ...args);
    }, options);
  }

  function createTestSelector<TState, TResult, TArgs extends any[]>(
    run: RunSelector<TState, TResult, TArgs>,
    options: SelectorOptions = {}
  ): Selector<TState, TResult, TArgs> {
    return createSelector((state, ...args) => {
      listing.push(`${options.name} run ${JSON.stringify(args)}`);
      return run(state, ...args);
    }, options);
  }

  function createTestSelectorExecutionResultsSharedCache<
    TState
  >(): SelectorExecutionResultsSharedCache<TState> {
    const delegate = createSelectorExecutionResultsSharedCache<TState>();
    return {
      getExecutionResult<TResult, TArgs extends any[]>(
        context: SelectorContext<TState>,
        selector: Selector<TState, TResult, TArgs>,
        args: TArgs
      ): SelectorExecutionResult<TState, TResult, TArgs> | undefined {
        const result = delegate.getExecutionResult(context, selector, args);
        if (result !== undefined) {
          listing.push(
            `cache hit ${selector.meta.options.name} ${JSON.stringify(
              args
            )} ${JSON.stringify(result)}`
          );
        } else {
          listing.push(
            `cache miss ${selector.meta.options.name} ${JSON.stringify(
              args
            )} ${JSON.stringify(result)}`
          );
        }
        return result;
      },
      addExecutionResult(executionResult: SelectorExecutionResult<TState>) {
        listing.push(
          `cache add ${
            executionResult.selector.meta.options.name
          } ${JSON.stringify(executionResult.args)} ${JSON.stringify(
            executionResult.result
          )} ${JSON.stringify(executionResult.inputs)}`
        );
        delegate.addExecutionResult(executionResult);
      },
      removeExecutionResult(executionResult: SelectorExecutionResult<TState>) {
        listing.push(
          `cache remove ${
            executionResult.selector.meta.options.name
          } ${JSON.stringify(executionResult.args)} ${JSON.stringify(
            executionResult.result
          )} ${JSON.stringify(executionResult.inputs)}`
        );
        delegate.removeExecutionResult(executionResult);
      },
    };
  }

  const selectFoo = createTestStateSelector((state: State) => state.foo, {
    name: 'selectFoo',
  });
  const selectBar = createTestStateSelector((state: State) => state.bar, {
    name: 'selectBar',
  });
  const selectN = createTestStateSelector((state: State) => state.n, {
    name: 'selectN',
  });
  const selectFooOrBar = createTestSelector(
    (ctx: SelectorContext<State>, source: 'foo' | 'bar') => {
      switch (source) {
        case 'foo':
          return selectFoo(ctx);
        case 'bar':
          return selectBar(ctx);
      }
    },
    { name: 'selectFooOrBar', share: true }
  );
  const selectSource = createTestSelector(
    (ctx: SelectorContext<State>) => {
      return selectN(ctx) % 2 === 0 ? 'foo' : 'bar';
    },
    { name: 'selectSource', share: true }
  );
  const selectRoot = createTestSelector(
    (ctx: SelectorContext<State>) => {
      const source = selectSource(ctx);
      return selectFooOrBar(ctx, source);
    },
    { name: 'selectRoot', share: true }
  );

  it('should share execution results', () => {
    const sharedCache = createTestSelectorExecutionResultsSharedCache<State>();
    const runner1 = createSelectorRunner(selectRoot, { sharedCache });
    const runner2 = createSelectorRunner(selectRoot, { sharedCache });

    listing.push(`runner1 run`);
    runner1.run({ n: 0, foo: 'foo', bar: 'bar' });
    listing.push(`runner2 run`);
    runner2.run({ n: 0, foo: 'foo', bar: 'bar' });

    expect(listing).toMatchInlineSnapshot(`
      Array [
        "runner1 run",
        "cache miss selectRoot [] undefined",
        "selectRoot run []",
        "cache miss selectSource [] undefined",
        "selectSource run []",
        "selectN run []",
        "cache miss selectFooOrBar [\\"foo\\"] undefined",
        "selectFooOrBar run [\\"foo\\"]",
        "selectFoo run []",
        "cache add selectSource [] \\"foo\\" [{\\"args\\":[],\\"result\\":0}]",
        "cache add selectFooOrBar [\\"foo\\"] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"}]",
        "cache add selectRoot [] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"},{\\"args\\":[\\"foo\\"],\\"result\\":\\"foo\\"}]",
        "runner2 run",
        "selectN run []",
        "cache hit selectSource [] {\\"result\\":\\"foo\\",\\"args\\":[],\\"inputs\\":[{\\"args\\":[],\\"result\\":0}]}",
        "selectFoo run []",
        "cache hit selectFooOrBar [\\"foo\\"] {\\"result\\":\\"foo\\",\\"args\\":[\\"foo\\"],\\"inputs\\":[{\\"args\\":[],\\"result\\":\\"foo\\"}]}",
        "cache hit selectRoot [] {\\"result\\":\\"foo\\",\\"args\\":[],\\"inputs\\":[{\\"args\\":[],\\"result\\":\\"foo\\"},{\\"args\\":[\\"foo\\"],\\"result\\":\\"foo\\"}]}",
        "cache add selectSource [] \\"foo\\" [{\\"args\\":[],\\"result\\":0}]",
        "cache add selectFooOrBar [\\"foo\\"] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"}]",
        "cache add selectRoot [] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"},{\\"args\\":[\\"foo\\"],\\"result\\":\\"foo\\"}]",
      ]
    `);
  });

  it('should not clear cache if there are refs', () => {
    const sharedCache = createTestSelectorExecutionResultsSharedCache<State>();
    const runner1 = createSelectorRunner(selectRoot, { sharedCache });
    const runner2 = createSelectorRunner(selectRoot, { sharedCache });
    const runner3 = createSelectorRunner(selectRoot, { sharedCache });

    listing.push(`runner1 run`);
    runner1.run({ n: 0, foo: 'foo', bar: 'bar' });
    listing.push(`runner2 run`);
    runner2.run({ n: 0, foo: 'foo', bar: 'bar' });
    listing.push('runner1 dispose');
    runner1.dispose();
    listing.push(`runner3 run`);
    runner3.run({ n: 0, foo: 'foo', bar: 'bar' });

    expect(listing).toMatchInlineSnapshot(`
      Array [
        "runner1 run",
        "cache miss selectRoot [] undefined",
        "selectRoot run []",
        "cache miss selectSource [] undefined",
        "selectSource run []",
        "selectN run []",
        "cache miss selectFooOrBar [\\"foo\\"] undefined",
        "selectFooOrBar run [\\"foo\\"]",
        "selectFoo run []",
        "cache add selectSource [] \\"foo\\" [{\\"args\\":[],\\"result\\":0}]",
        "cache add selectFooOrBar [\\"foo\\"] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"}]",
        "cache add selectRoot [] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"},{\\"args\\":[\\"foo\\"],\\"result\\":\\"foo\\"}]",
        "runner2 run",
        "selectN run []",
        "cache hit selectSource [] {\\"result\\":\\"foo\\",\\"args\\":[],\\"inputs\\":[{\\"args\\":[],\\"result\\":0}]}",
        "selectFoo run []",
        "cache hit selectFooOrBar [\\"foo\\"] {\\"result\\":\\"foo\\",\\"args\\":[\\"foo\\"],\\"inputs\\":[{\\"args\\":[],\\"result\\":\\"foo\\"}]}",
        "cache hit selectRoot [] {\\"result\\":\\"foo\\",\\"args\\":[],\\"inputs\\":[{\\"args\\":[],\\"result\\":\\"foo\\"},{\\"args\\":[\\"foo\\"],\\"result\\":\\"foo\\"}]}",
        "cache add selectSource [] \\"foo\\" [{\\"args\\":[],\\"result\\":0}]",
        "cache add selectFooOrBar [\\"foo\\"] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"}]",
        "cache add selectRoot [] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"},{\\"args\\":[\\"foo\\"],\\"result\\":\\"foo\\"}]",
        "runner1 dispose",
        "cache remove selectSource [] \\"foo\\" [{\\"args\\":[],\\"result\\":0}]",
        "cache remove selectFooOrBar [\\"foo\\"] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"}]",
        "cache remove selectRoot [] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"},{\\"args\\":[\\"foo\\"],\\"result\\":\\"foo\\"}]",
        "runner3 run",
        "selectN run []",
        "cache hit selectSource [] {\\"result\\":\\"foo\\",\\"args\\":[],\\"inputs\\":[{\\"args\\":[],\\"result\\":0}]}",
        "selectFoo run []",
        "cache hit selectFooOrBar [\\"foo\\"] {\\"result\\":\\"foo\\",\\"args\\":[\\"foo\\"],\\"inputs\\":[{\\"args\\":[],\\"result\\":\\"foo\\"}]}",
        "cache hit selectRoot [] {\\"result\\":\\"foo\\",\\"args\\":[],\\"inputs\\":[{\\"args\\":[],\\"result\\":\\"foo\\"},{\\"args\\":[\\"foo\\"],\\"result\\":\\"foo\\"}]}",
        "cache add selectSource [] \\"foo\\" [{\\"args\\":[],\\"result\\":0}]",
        "cache add selectFooOrBar [\\"foo\\"] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"}]",
        "cache add selectRoot [] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"},{\\"args\\":[\\"foo\\"],\\"result\\":\\"foo\\"}]",
      ]
    `);
  });

  it('should clear cache if there are no refs', () => {
    const sharedCache = createTestSelectorExecutionResultsSharedCache<State>();
    const runner1 = createSelectorRunner(selectRoot, { sharedCache });
    const runner2 = createSelectorRunner(selectRoot, { sharedCache });
    const runner3 = createSelectorRunner(selectRoot, { sharedCache });

    listing.push(`runner1 run`);
    runner1.run({ n: 0, foo: 'foo', bar: 'bar' });
    listing.push(`runner2 run`);
    runner2.run({ n: 0, foo: 'foo', bar: 'bar' });
    listing.push('runner1 dispose');
    runner1.dispose();
    listing.push('runner2 dispose');
    runner2.dispose();
    listing.push(`runner3 run`);
    runner3.run({ n: 0, foo: 'foo', bar: 'bar' });

    expect(listing).toMatchInlineSnapshot(`
      Array [
        "runner1 run",
        "cache miss selectRoot [] undefined",
        "selectRoot run []",
        "cache miss selectSource [] undefined",
        "selectSource run []",
        "selectN run []",
        "cache miss selectFooOrBar [\\"foo\\"] undefined",
        "selectFooOrBar run [\\"foo\\"]",
        "selectFoo run []",
        "cache add selectSource [] \\"foo\\" [{\\"args\\":[],\\"result\\":0}]",
        "cache add selectFooOrBar [\\"foo\\"] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"}]",
        "cache add selectRoot [] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"},{\\"args\\":[\\"foo\\"],\\"result\\":\\"foo\\"}]",
        "runner2 run",
        "selectN run []",
        "cache hit selectSource [] {\\"result\\":\\"foo\\",\\"args\\":[],\\"inputs\\":[{\\"args\\":[],\\"result\\":0}]}",
        "selectFoo run []",
        "cache hit selectFooOrBar [\\"foo\\"] {\\"result\\":\\"foo\\",\\"args\\":[\\"foo\\"],\\"inputs\\":[{\\"args\\":[],\\"result\\":\\"foo\\"}]}",
        "cache hit selectRoot [] {\\"result\\":\\"foo\\",\\"args\\":[],\\"inputs\\":[{\\"args\\":[],\\"result\\":\\"foo\\"},{\\"args\\":[\\"foo\\"],\\"result\\":\\"foo\\"}]}",
        "cache add selectSource [] \\"foo\\" [{\\"args\\":[],\\"result\\":0}]",
        "cache add selectFooOrBar [\\"foo\\"] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"}]",
        "cache add selectRoot [] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"},{\\"args\\":[\\"foo\\"],\\"result\\":\\"foo\\"}]",
        "runner1 dispose",
        "cache remove selectSource [] \\"foo\\" [{\\"args\\":[],\\"result\\":0}]",
        "cache remove selectFooOrBar [\\"foo\\"] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"}]",
        "cache remove selectRoot [] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"},{\\"args\\":[\\"foo\\"],\\"result\\":\\"foo\\"}]",
        "runner2 dispose",
        "cache remove selectSource [] \\"foo\\" [{\\"args\\":[],\\"result\\":0}]",
        "cache remove selectFooOrBar [\\"foo\\"] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"}]",
        "cache remove selectRoot [] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"},{\\"args\\":[\\"foo\\"],\\"result\\":\\"foo\\"}]",
        "runner3 run",
        "cache miss selectRoot [] undefined",
        "selectRoot run []",
        "cache miss selectSource [] undefined",
        "selectSource run []",
        "selectN run []",
        "cache miss selectFooOrBar [\\"foo\\"] undefined",
        "selectFooOrBar run [\\"foo\\"]",
        "selectFoo run []",
        "cache add selectSource [] \\"foo\\" [{\\"args\\":[],\\"result\\":0}]",
        "cache add selectFooOrBar [\\"foo\\"] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"}]",
        "cache add selectRoot [] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"},{\\"args\\":[\\"foo\\"],\\"result\\":\\"foo\\"}]",
      ]
    `);
  });

  it('should share execution results across state changes', () => {
    const sharedCache = createTestSelectorExecutionResultsSharedCache<State>();
    const runner1 = createSelectorRunner(selectRoot, { sharedCache });
    const runner2 = createSelectorRunner(selectRoot, { sharedCache });

    listing.push(`runner1 run`);
    runner1.run({ n: 0, foo: 'foo', bar: 'bar' });
    listing.push(`runner2 run`);
    runner2.run({ n: 2, foo: 'foo', bar: 'bar' });

    expect(listing).toMatchInlineSnapshot(`
      Array [
        "runner1 run",
        "cache miss selectRoot [] undefined",
        "selectRoot run []",
        "cache miss selectSource [] undefined",
        "selectSource run []",
        "selectN run []",
        "cache miss selectFooOrBar [\\"foo\\"] undefined",
        "selectFooOrBar run [\\"foo\\"]",
        "selectFoo run []",
        "cache add selectSource [] \\"foo\\" [{\\"args\\":[],\\"result\\":0}]",
        "cache add selectFooOrBar [\\"foo\\"] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"}]",
        "cache add selectRoot [] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"},{\\"args\\":[\\"foo\\"],\\"result\\":\\"foo\\"}]",
        "runner2 run",
        "selectN run []",
        "cache miss selectSource [] undefined",
        "selectSource run []",
        "selectFoo run []",
        "cache hit selectFooOrBar [\\"foo\\"] {\\"result\\":\\"foo\\",\\"args\\":[\\"foo\\"],\\"inputs\\":[{\\"args\\":[],\\"result\\":\\"foo\\"}]}",
        "cache hit selectRoot [] {\\"result\\":\\"foo\\",\\"args\\":[],\\"inputs\\":[{\\"args\\":[],\\"result\\":\\"foo\\"},{\\"args\\":[\\"foo\\"],\\"result\\":\\"foo\\"}]}",
        "cache add selectSource [] \\"foo\\" [{\\"args\\":[],\\"result\\":2}]",
        "cache add selectFooOrBar [\\"foo\\"] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"}]",
        "cache add selectRoot [] \\"foo\\" [{\\"args\\":[],\\"result\\":\\"foo\\"},{\\"args\\":[\\"foo\\"],\\"result\\":\\"foo\\"}]",
      ]
    `);
  });
});
