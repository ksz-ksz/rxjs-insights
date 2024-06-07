import {
  addExecutionResult,
  AnySelector,
  areArgsEqual,
  createSelector,
  createSelectorContext,
  createStateSelector,
  findExecutionResult,
  Selector,
  SelectorContext,
  SelectorExecutionResult,
  SelectorExecutionResultsMap,
} from './selector';
import { TestSelectorContext } from './test-selector-context';

interface State {
  foo: string;
  bar: string;
}

type Case = 'uppercase' | 'lowercase' | 'flipcase';

function createTestSelectorContext<TState>(
  state: TState,
  cachedExecutionResultsMap?: SelectorExecutionResultsMap<TState>
) {
  return new TestSelectorContext(state, cachedExecutionResultsMap);
}

const selectFoo = createStateSelector((state: State) => state.foo);
const selectBar = createStateSelector((state: State) => state.bar);

function isLowerCase(str: string) {
  return str === str.toLowerCase() && str !== str.toUpperCase();
}

function toFlipCase(str: string) {
  return [...str]
    .map((char) =>
      isLowerCase(char) ? char.toUpperCase() : char.toLowerCase()
    )
    .join('');
}

const selectCasedFoo = createSelector(
  (ctx: SelectorContext<State>, fooCase: Case) => {
    switch (fooCase) {
      case 'lowercase':
        return selectFoo(ctx).toLowerCase();
      case 'uppercase':
        return selectFoo(ctx).toUpperCase();
      case 'flipcase':
        return toFlipCase(selectFoo(ctx));
    }
  }
);

const selectCasedBar = createSelector(
  (ctx: SelectorContext<State>, barCase: Case) => {
    switch (barCase) {
      case 'lowercase':
        return selectBar(ctx).toLowerCase();
      case 'uppercase':
        return selectBar(ctx).toUpperCase();
      case 'flipcase':
        return toFlipCase(selectBar(ctx));
    }
  }
);

const selectCasedFooBar = createSelector(
  (ctx: SelectorContext<State>, fooCase: Case, barCase: Case) => {
    return selectCasedFoo(ctx, fooCase) + selectCasedBar(ctx, barCase);
  }
);

function createExecutionResult<TState, TResult, TArgs extends any[]>({
  selector,
  args,
  result,
  hasRun = true,
  inputs = [],
}: {
  selector: AnySelector<TState, TResult, TArgs>;
  args: TArgs;
  result: TResult;
  hasRun?: boolean;
  inputs?: SelectorExecutionResult<TState>[];
}): SelectorExecutionResult<TState, TResult, TArgs> {
  return {
    selector,
    args,
    result,
    hasRun,
    inputs,
  };
}

function createExecutionResultsMap<TState>(
  rootExecutionResult: SelectorExecutionResult<TState>
) {
  const executionResultsMap: SelectorExecutionResultsMap<TState> = new Map();

  function visit(executionResult: SelectorExecutionResult<TState>) {
    if (
      findExecutionResult(
        executionResultsMap,
        executionResult.selector,
        executionResult.args
      ) === undefined
    ) {
      addExecutionResult(executionResultsMap, executionResult);
      for (const input of executionResult.inputs) {
        visit(input);
      }
    }
  }

  visit(rootExecutionResult);

  return executionResultsMap;
}

interface TestCase {
  description: string;
  prevExecutionResult?: SelectorExecutionResult<State>;
  state: State;
  executionResult: SelectorExecutionResult<State>;
}

const initialExecutionResult = createExecutionResult({
  selector: selectCasedFooBar,
  args: ['lowercase', 'lowercase'],
  result: 'foobar',
  hasRun: true,
  inputs: [
    createExecutionResult({
      selector: selectCasedFoo,
      args: ['lowercase'],
      result: 'foo',
      hasRun: true,
      inputs: [
        createExecutionResult({
          selector: selectFoo,
          args: [],
          result: 'foo',
          hasRun: true,
        }),
      ],
    }),
    createExecutionResult({
      selector: selectCasedBar,
      args: ['lowercase'],
      result: 'bar',
      hasRun: true,
      inputs: [
        createExecutionResult({
          selector: selectBar,
          args: [],
          result: 'bar',
          hasRun: true,
        }),
      ],
    }),
  ],
});
const testCases: TestCase[] = [
  {
    description: 'initial',
    state: {
      foo: 'foo',
      bar: 'bar',
    },
    executionResult: initialExecutionResult,
  },
  {
    description: 'foo changes to FOO',
    prevExecutionResult: initialExecutionResult,
    state: {
      foo: 'FOO',
      bar: 'bar',
    },
    executionResult: createExecutionResult({
      selector: selectCasedFooBar,
      args: ['lowercase', 'lowercase'],
      result: 'foobar',
      hasRun: false,
      inputs: [
        createExecutionResult({
          selector: selectCasedFoo,
          args: ['lowercase'],
          result: 'foo',
          hasRun: true,
          inputs: [
            createExecutionResult({
              selector: selectFoo,
              args: [],
              result: 'FOO',
              hasRun: true,
            }),
          ],
        }),
        createExecutionResult({
          selector: selectCasedBar,
          args: ['lowercase'],
          result: 'bar',
          hasRun: false,
          inputs: [
            createExecutionResult({
              selector: selectBar,
              args: [],
              result: 'bar',
              hasRun: true,
            }),
          ],
        }),
      ],
    }),
  },
  {
    description: 'foo changes to F',
    prevExecutionResult: initialExecutionResult,
    state: {
      foo: 'F',
      bar: 'bar',
    },
    executionResult: createExecutionResult({
      selector: selectCasedFooBar,
      args: ['lowercase', 'lowercase'],
      result: 'fbar',
      hasRun: true,
      inputs: [
        createExecutionResult({
          selector: selectCasedFoo,
          args: ['lowercase'],
          result: 'f',
          hasRun: true,
          inputs: [
            createExecutionResult({
              selector: selectFoo,
              args: [],
              result: 'F',
              hasRun: true,
            }),
          ],
        }),
        createExecutionResult({
          selector: selectCasedBar,
          args: ['lowercase'],
          result: 'bar',
          hasRun: false,
          inputs: [
            createExecutionResult({
              selector: selectBar,
              args: [],
              result: 'bar',
              hasRun: true,
            }),
          ],
        }),
      ],
    }),
  },
  {
    description: 'bar changes to BAR',
    prevExecutionResult: initialExecutionResult,
    state: {
      foo: 'foo',
      bar: 'BAR',
    },
    executionResult: createExecutionResult({
      selector: selectCasedFooBar,
      args: ['lowercase', 'lowercase'],
      result: 'foobar',
      hasRun: false,
      inputs: [
        createExecutionResult({
          selector: selectCasedFoo,
          args: ['lowercase'],
          result: 'foo',
          hasRun: false,
          inputs: [
            createExecutionResult({
              selector: selectFoo,
              args: [],
              result: 'foo',
              hasRun: true,
            }),
          ],
        }),
        createExecutionResult({
          selector: selectCasedBar,
          args: ['lowercase'],
          result: 'bar',
          hasRun: true,
          inputs: [
            createExecutionResult({
              selector: selectBar,
              args: [],
              result: 'BAR',
              hasRun: true,
            }),
          ],
        }),
      ],
    }),
  },
  {
    description: 'bar changes to B',
    prevExecutionResult: initialExecutionResult,
    state: {
      foo: 'foo',
      bar: 'B',
    },
    executionResult: createExecutionResult({
      selector: selectCasedFooBar,
      args: ['lowercase', 'lowercase'],
      result: 'foob',
      hasRun: true,
      inputs: [
        createExecutionResult({
          selector: selectCasedFoo,
          args: ['lowercase'],
          result: 'foo',
          hasRun: false,
          inputs: [
            createExecutionResult({
              selector: selectFoo,
              args: [],
              result: 'foo',
              hasRun: true,
            }),
          ],
        }),
        createExecutionResult({
          selector: selectCasedBar,
          args: ['lowercase'],
          result: 'b',
          hasRun: true,
          inputs: [
            createExecutionResult({
              selector: selectBar,
              args: [],
              result: 'B',
              hasRun: true,
            }),
          ],
        }),
      ],
    }),
  },
  {
    description: 'foo changes to FOO, bar changes to BAR',
    prevExecutionResult: initialExecutionResult,
    state: {
      foo: 'FOO',
      bar: 'BAR',
    },
    executionResult: createExecutionResult({
      selector: selectCasedFooBar,
      args: ['lowercase', 'lowercase'],
      result: 'foobar',
      hasRun: false,
      inputs: [
        createExecutionResult({
          selector: selectCasedFoo,
          args: ['lowercase'],
          result: 'foo',
          hasRun: true,
          inputs: [
            createExecutionResult({
              selector: selectFoo,
              args: [],
              result: 'FOO',
              hasRun: true,
            }),
          ],
        }),
        createExecutionResult({
          selector: selectCasedBar,
          args: ['lowercase'],
          result: 'bar',
          hasRun: true,
          inputs: [
            createExecutionResult({
              selector: selectBar,
              args: [],
              result: 'BAR',
              hasRun: true,
            }),
          ],
        }),
      ],
    }),
  },
  {
    description: 'foo changes to F, bar changes to B',
    prevExecutionResult: initialExecutionResult,
    state: {
      foo: 'F',
      bar: 'B',
    },
    executionResult: createExecutionResult({
      selector: selectCasedFooBar,
      args: ['lowercase', 'lowercase'],
      result: 'fb',
      hasRun: true,
      inputs: [
        createExecutionResult({
          selector: selectCasedFoo,
          args: ['lowercase'],
          result: 'f',
          hasRun: true,
          inputs: [
            createExecutionResult({
              selector: selectFoo,
              args: [],
              result: 'F',
              hasRun: true,
            }),
          ],
        }),
        createExecutionResult({
          selector: selectCasedBar,
          args: ['lowercase'],
          result: 'b',
          hasRun: true,
          inputs: [
            createExecutionResult({
              selector: selectBar,
              args: [],
              result: 'B',
              hasRun: true,
            }),
          ],
        }),
      ],
    }),
  },
  {
    description: 'fooCase changes',
    prevExecutionResult: initialExecutionResult,
    state: {
      foo: 'foo',
      bar: 'bar',
    },
    executionResult: createExecutionResult({
      selector: selectCasedFooBar,
      args: ['uppercase', 'lowercase'],
      result: 'FOObar',
      hasRun: true,
      inputs: [
        createExecutionResult({
          selector: selectCasedFoo,
          args: ['uppercase'],
          result: 'FOO',
          hasRun: true,
          inputs: [
            createExecutionResult({
              selector: selectFoo,
              args: [],
              result: 'foo',
              hasRun: true,
            }),
          ],
        }),
        createExecutionResult({
          selector: selectCasedBar,
          args: ['lowercase'],
          result: 'bar',
          hasRun: false,
          inputs: [
            createExecutionResult({
              selector: selectBar,
              args: [],
              result: 'bar',
              hasRun: true,
            }),
          ],
        }),
      ],
    }),
  },
  {
    description: 'barCase changes',
    prevExecutionResult: initialExecutionResult,
    state: {
      foo: 'foo',
      bar: 'bar',
    },
    executionResult: createExecutionResult({
      selector: selectCasedFooBar,
      args: ['lowercase', 'uppercase'],
      result: 'fooBAR',
      hasRun: true,
      inputs: [
        createExecutionResult({
          selector: selectCasedFoo,
          args: ['lowercase'],
          result: 'foo',
          hasRun: false,
          inputs: [
            createExecutionResult({
              selector: selectFoo,
              args: [],
              result: 'foo',
              hasRun: true,
            }),
          ],
        }),
        createExecutionResult({
          selector: selectCasedBar,
          args: ['uppercase'],
          result: 'BAR',
          hasRun: true,
          inputs: [
            createExecutionResult({
              selector: selectBar,
              args: [],
              result: 'bar',
              hasRun: true,
            }),
          ],
        }),
      ],
    }),
  },
  {
    description: 'fooCase changes, barCase changes',
    prevExecutionResult: initialExecutionResult,
    state: {
      foo: 'foo',
      bar: 'bar',
    },
    executionResult: createExecutionResult({
      selector: selectCasedFooBar,
      args: ['uppercase', 'uppercase'],
      result: 'FOOBAR',
      hasRun: true,
      inputs: [
        createExecutionResult({
          selector: selectCasedFoo,
          args: ['uppercase'],
          result: 'FOO',
          hasRun: true,
          inputs: [
            createExecutionResult({
              selector: selectFoo,
              args: [],
              result: 'foo',
              hasRun: true,
            }),
          ],
        }),
        createExecutionResult({
          selector: selectCasedBar,
          args: ['uppercase'],
          result: 'BAR',
          hasRun: true,
          inputs: [
            createExecutionResult({
              selector: selectBar,
              args: [],
              result: 'bar',
              hasRun: true,
            }),
          ],
        }),
      ],
    }),
  },
  {
    description: 'foo changes to FOO, fooCase flips',
    prevExecutionResult: initialExecutionResult,
    state: {
      foo: 'FOO',
      bar: 'bar',
    },
    executionResult: createExecutionResult({
      selector: selectCasedFooBar,
      args: ['flipcase', 'lowercase'],
      result: 'foobar',
      hasRun: true,
      inputs: [
        createExecutionResult({
          selector: selectCasedFoo,
          args: ['flipcase'],
          result: 'foo',
          hasRun: true,
          inputs: [
            createExecutionResult({
              selector: selectFoo,
              args: [],
              result: 'FOO',
              hasRun: true,
            }),
          ],
        }),
        createExecutionResult({
          selector: selectCasedBar,
          args: ['lowercase'],
          result: 'bar',
          hasRun: false,
          inputs: [
            createExecutionResult({
              selector: selectBar,
              args: [],
              result: 'bar',
              hasRun: true,
            }),
          ],
        }),
      ],
    }),
  },
  {
    description: 'bar changes to BAR, barCase flips',
    prevExecutionResult: initialExecutionResult,
    state: {
      foo: 'foo',
      bar: 'BAR',
    },
    executionResult: createExecutionResult({
      selector: selectCasedFooBar,
      args: ['lowercase', 'flipcase'],
      result: 'foobar',
      hasRun: true,
      inputs: [
        createExecutionResult({
          selector: selectCasedFoo,
          args: ['lowercase'],
          result: 'foo',
          hasRun: false,
          inputs: [
            createExecutionResult({
              selector: selectFoo,
              args: [],
              result: 'foo',
              hasRun: true,
            }),
          ],
        }),
        createExecutionResult({
          selector: selectCasedBar,
          args: ['flipcase'],
          result: 'bar',
          hasRun: true,
          inputs: [
            createExecutionResult({
              selector: selectBar,
              args: [],
              result: 'BAR',
              hasRun: true,
            }),
          ],
        }),
      ],
    }),
  },
];

function fail(message: string, a: any, b: any) {
  throw new Error(
    `${message}. a: ${JSON.stringify(a)}, b: ${JSON.stringify(b)}`
  );
}

function verifyExecutionResultsEqual(
  a: SelectorExecutionResult<State>,
  b: SelectorExecutionResult<State>,
  path: string = 'root'
): void {
  if (a.selector !== b.selector) {
    fail(`selectors are different at ${path}`, a.selector, b.selector);
  }

  if (!areArgsEqual(a.args, b.args)) {
    fail(`args are different at ${path}`, a.args, b.args);
  }

  if (a.result !== b.result) {
    fail(`results are different at ${path}`, a.result, b.result);
  }

  if (a.hasRun !== b.hasRun) {
    fail(`hasRuns are different at ${path}`, a.hasRun, b.hasRun);
  }

  if (a.inputs.length !== b.inputs.length) {
    fail(
      `number of inputs are different at ${path}`,
      a.inputs.length,
      b.inputs.length
    );
  }

  const n = a.inputs.length;
  for (let i = 0; i < n; i++) {
    const aInput = a.inputs[i];
    const bInput = b.inputs[i];
    verifyExecutionResultsEqual(aInput, bInput, `${path}.${i}`);
  }
}

function verifyExecutionResultsMapEqual(
  aMap: SelectorExecutionResultsMap<State>,
  bMap: SelectorExecutionResultsMap<State>
) {
  for (let [aSelector, aResults] of aMap) {
    for (let aResult of aResults) {
      const found = findExecutionResult(bMap, aSelector, aResult.args);
      if (found === undefined) {
        fail('result not found', aMap, bMap);
      }
    }
  }

  for (let [bSelector, bResults] of bMap) {
    for (let bResult of bResults) {
      const found = findExecutionResult(aMap, bSelector, bResult.args);
      if (found === undefined) {
        fail('result not found', aMap, bMap);
      }
    }
  }
}

describe('selector', () => {
  for (const testCase of testCases) {
    it(testCase.description, () => {
      const ctx = createSelectorContext(
        testCase.state,
        testCase.prevExecutionResult !== undefined
          ? createExecutionResultsMap(testCase.prevExecutionResult)
          : undefined
      );
      const executionResult = ctx.runSelector(
        testCase.executionResult.selector as Selector<any, any, any>,
        testCase.executionResult.args
      );

      verifyExecutionResultsEqual(executionResult, testCase.executionResult);
      verifyExecutionResultsMapEqual(
        createExecutionResultsMap(executionResult),
        createExecutionResultsMap(testCase.executionResult)
      );
    });
  }
});

// describe('selector-new', () => {
//   it('should return correct value', () => {});
//
//   it('should work', () => {
//     const ctx1 = createSelectorContext({
//       foo: 'foo',
//       bar: 'bar',
//     });
//
//     const result1 = selectCasedFooBar(ctx1);
//     const execution1 = ctx1.getExecutionResultsMap();
//
//     const ctx2 = createSelectorContext(
//       {
//         foo: 'FOO',
//         bar: 'bar',
//       },
//       execution1
//     );
//
//     const result2 = selectCasedFooBar(ctx2);
//     const execution2 = ctx2.getExecutionResultsMap();
//
//     console.log({ ctx1, result1, execution1, ctx2, result2, execution2 });
//   });
//
//   it('should fibonacci', () => {
//     const selectFibonacci = createSelector(
//       (ctx: SelectorContext<void>, i: number): number => {
//         switch (i) {
//           case 0:
//             return 0;
//           case 1:
//             return 1;
//           default:
//             return selectFibonacci(ctx, i - 1) + selectFibonacci(ctx, i - 2);
//         }
//       }
//     );
//
//     const ctx1 = createTestSelectorContext<void>(undefined);
//     const result1 = selectFibonacci(ctx1, 5);
//     const exec1 = ctx1.getExecutionResultsMap();
//
//     const ctx2 = createTestSelectorContext<void>(
//       undefined,
//       ctx1.getExecutionResultsMap()
//     );
//     const result2 = selectFibonacci(ctx2, 7);
//     const exec2 = ctx2.getExecutionResultsMap();
//
//     console.log({ ctx1, result1, exec1, ctx2, result2, exec2 });
//   });
// });
