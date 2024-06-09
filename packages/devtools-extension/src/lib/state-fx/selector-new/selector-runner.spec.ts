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
const selectFooOrBar = createSelector(
  (ctx: SelectorContext<State>, source: 'foo' | 'bar') => {
    switch (source) {
      case 'foo':
        return selectFoo(ctx);
      case 'bar':
        return selectBar(ctx);
    }
  },
  { name: 'selectFooOrBar' }
);
const selectSource = createSelector(
  (ctx: SelectorContext<State>) => {
    return selectN(ctx) % 2 === 0 ? 'foo' : 'bar';
  },
  { name: 'selectSource' }
);
const selectRoot = createSelector(
  (ctx: SelectorContext<State>) => {
    const source = selectSource(ctx);
    return selectFooOrBar(ctx, source);
  },
  { name: 'selectRoot' }
);

describe('selector-runner', () => {
  it('should work', () => {
    const listing: string[] = [];
    const runner = createSelectorRunner(selectRoot, {
      onSelectorActivated(selector, args) {
        listing.push(
          `onSelectorActivated ${selector.meta.options.name} ${JSON.stringify(
            args
          )}`
        );
      },
      onSelectorDeactivated(selector, args) {
        listing.push(
          `onSelectorDeactivated ${selector.meta.options.name} ${JSON.stringify(
            args
          )}`
        );
      },
      onExecutionResultAdded(result) {
        listing.push(
          `onExecutionResultAdded ${
            result.selector.meta.options.name
          } ${JSON.stringify(result.result)} ${JSON.stringify(
            result.args
          )} ${JSON.stringify(result.inputs, (key, value) =>
            key === 'selector' ? value.meta.options.name : value
          )}`
        );
      },
      onExecutionResultRemoved(result) {
        listing.push(
          `onExecutionResultRemoved ${
            result.selector.meta.options.name
          } ${JSON.stringify(result.result)} ${JSON.stringify(
            result.args
          )} ${JSON.stringify(result.inputs, (key, value) =>
            key === 'selector' ? value.meta.options.name : value
          )}`
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
        "onExecutionResultAdded selectN 0 [] []",
        "onExecutionResultAdded selectSource \\"foo\\" [] [{\\"selector\\":\\"selectN\\",\\"args\\":[],\\"result\\":0}]",
        "onExecutionResultAdded selectFoo \\"foo\\" [] []",
        "onExecutionResultAdded selectFooOrBar \\"foo\\" [\\"foo\\"] [{\\"selector\\":\\"selectFoo\\",\\"args\\":[],\\"result\\":\\"foo\\"}]",
        "onExecutionResultAdded selectRoot \\"foo\\" [] [{\\"selector\\":\\"selectSource\\",\\"args\\":[],\\"result\\":\\"foo\\"},{\\"selector\\":\\"selectFooOrBar\\",\\"args\\":[\\"foo\\"],\\"result\\":\\"foo\\"}]",
        "onSelectorActivated selectN []",
        "onSelectorActivated selectSource []",
        "onSelectorActivated selectFoo []",
        "onSelectorActivated selectFooOrBar [\\"foo\\"]",
        "onSelectorActivated selectRoot []",
        "run",
        "onExecutionResultRemoved selectN 0 [] []",
        "onExecutionResultRemoved selectSource \\"foo\\" [] [{\\"selector\\":\\"selectN\\",\\"args\\":[],\\"result\\":0}]",
        "onExecutionResultRemoved selectFoo \\"foo\\" [] []",
        "onExecutionResultRemoved selectFooOrBar \\"foo\\" [\\"foo\\"] [{\\"selector\\":\\"selectFoo\\",\\"args\\":[],\\"result\\":\\"foo\\"}]",
        "onExecutionResultRemoved selectRoot \\"foo\\" [] [{\\"selector\\":\\"selectSource\\",\\"args\\":[],\\"result\\":\\"foo\\"},{\\"selector\\":\\"selectFooOrBar\\",\\"args\\":[\\"foo\\"],\\"result\\":\\"foo\\"}]",
        "onExecutionResultAdded selectN 1 [] []",
        "onExecutionResultAdded selectSource \\"bar\\" [] [{\\"selector\\":\\"selectN\\",\\"args\\":[],\\"result\\":1}]",
        "onExecutionResultAdded selectBar \\"bar\\" [] []",
        "onExecutionResultAdded selectFooOrBar \\"bar\\" [\\"bar\\"] [{\\"selector\\":\\"selectBar\\",\\"args\\":[],\\"result\\":\\"bar\\"}]",
        "onExecutionResultAdded selectRoot \\"bar\\" [] [{\\"selector\\":\\"selectSource\\",\\"args\\":[],\\"result\\":\\"bar\\"},{\\"selector\\":\\"selectFooOrBar\\",\\"args\\":[\\"bar\\"],\\"result\\":\\"bar\\"}]",
        "onSelectorDeactivated selectFoo []",
        "onSelectorDeactivated selectFooOrBar [\\"foo\\"]",
        "onSelectorActivated selectBar []",
        "onSelectorActivated selectFooOrBar [\\"bar\\"]",
        "destroy",
        "onExecutionResultRemoved selectN 1 [] []",
        "onExecutionResultRemoved selectSource \\"bar\\" [] [{\\"selector\\":\\"selectN\\",\\"args\\":[],\\"result\\":1}]",
        "onExecutionResultRemoved selectBar \\"bar\\" [] []",
        "onExecutionResultRemoved selectFooOrBar \\"bar\\" [\\"bar\\"] [{\\"selector\\":\\"selectBar\\",\\"args\\":[],\\"result\\":\\"bar\\"}]",
        "onExecutionResultRemoved selectRoot \\"bar\\" [] [{\\"selector\\":\\"selectSource\\",\\"args\\":[],\\"result\\":\\"bar\\"},{\\"selector\\":\\"selectFooOrBar\\",\\"args\\":[\\"bar\\"],\\"result\\":\\"bar\\"}]",
        "onSelectorDeactivated selectN []",
        "onSelectorDeactivated selectSource []",
        "onSelectorDeactivated selectBar []",
        "onSelectorDeactivated selectFooOrBar [\\"bar\\"]",
        "onSelectorDeactivated selectRoot []",
      ]
    `);
  });
});
