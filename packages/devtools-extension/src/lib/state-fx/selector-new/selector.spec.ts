import {
  createSelector,
  createSelectorContext,
  createStateSelector,
  SelectorContext,
} from './selector';

interface State {
  foo: string;
  bar: string;
}

describe('selector-new', () => {
  it('should work', () => {
    const selectFoo = createStateSelector((state: State) => state.foo);
    const selectBar = createStateSelector((state: State) => state.bar);

    const selectFOO = createSelector((ctx: SelectorContext<State>) =>
      selectFoo(ctx).toUpperCase()
    );

    const selectBAR = createSelector((ctx: SelectorContext<State>) =>
      selectBar(ctx).toUpperCase()
    );

    const selectFOOBAR = createSelector((ctx: SelectorContext<State>) => {
      return selectFOO(ctx) + selectBAR(ctx);
    });

    const ctx1 = createSelectorContext({
      foo: 'foo',
      bar: 'bar',
    });

    const result1 = selectFOOBAR(ctx1);
    const execution1 = ctx1.getExecutionResults();

    const ctx2 = createSelectorContext(
      {
        foo: 'FOO',
        bar: 'bar',
      },
      execution1
    );

    const result2 = selectFOOBAR(ctx2);
    const execution2 = ctx2.getExecutionResults();

    console.log({ ctx1, result1, execution1, ctx2, result2, execution2 });
  });

  it('should fibonacci', () => {
    const selectFibonacci = createSelector(
      (ctx: SelectorContext<void>, i: number): number => {
        switch (i) {
          case 0:
            return 0;
          case 1:
            return 1;
          default:
            return selectFibonacci(ctx, i - 1) + selectFibonacci(ctx, i - 2);
        }
      }
    );

    const ctx1 = createSelectorContext(undefined);
    const result1 = selectFibonacci(ctx1, 5);
    const exec1 = ctx1.getExecutionResults();

    const ctx2 = createSelectorContext(undefined, ctx1.getExecutionResults());
    const result2 = selectFibonacci(ctx2, 7);
    const exec2 = ctx2.getExecutionResults();

    console.log({ ctx1, result1, exec1, ctx2, result2, exec2 });
  });
});
