import {
  createSelector,
  createStateSelector,
  SelectorContext,
} from './selector';
import { createSelectorRunner } from './selector-runner';

interface State {
  n: number;
  foo: string;
  bar: string;
}

const selectFoo = createStateSelector((state: State) => state.foo, {
  name: 'selectFoo',
});
const selectBar = createStateSelector((state: State) => state.bar, {
  name: 'selectBar',
});
const selectN = createStateSelector((state: State) => state.n, {
  name: 'selectN',
});
const selectSource = createSelector(
  (ctx: SelectorContext<State>, source: 'foo' | 'bar') => {
    switch (source) {
      case 'foo':
        return selectFoo(ctx);
      case 'bar':
        return selectBar(ctx);
    }
  },
  { name: 'selectSource' }
);
const selectRoot = createSelector(
  (ctx: SelectorContext<State>) => {
    const source = selectN(ctx) % 2 === 0 ? 'foo' : 'bar';
    return selectSource(ctx, source);
  },
  { name: 'selectRoot' }
);

describe('selector-runner', () => {
  it('should work', () => {
    const listing: string[] = [];
    const runner = createSelectorRunner(selectRoot, {
      onActivate(selector, args) {
        listing.push(
          `activate ${selector.meta.options.name} ${JSON.stringify(args)}`
        );
      },
      onDeactivate(selector, args) {
        listing.push(
          `deactivate ${selector.meta.options.name} ${JSON.stringify(args)}`
        );
      },
    });

    listing.push('run');
    runner.run({ n: 0, foo: 'foo', bar: 'bar' });
    listing.push('run');
    runner.run({ n: 1, foo: 'foo', bar: 'bar' });
    listing.push('destroy');
    runner.dispose();

    expect(listing).toMatchInlineSnapshot(`
      Array [
        "run",
        "activate selectN []",
        "activate selectFoo []",
        "activate selectSource [\\"foo\\"]",
        "activate selectRoot []",
        "run",
        "deactivate selectFoo []",
        "deactivate selectSource [\\"foo\\"]",
        "activate selectBar []",
        "activate selectSource [\\"bar\\"]",
        "destroy",
        "deactivate selectN []",
        "deactivate selectBar []",
        "deactivate selectSource [\\"bar\\"]",
        "deactivate selectRoot []",
      ]
    `);
  });
});
