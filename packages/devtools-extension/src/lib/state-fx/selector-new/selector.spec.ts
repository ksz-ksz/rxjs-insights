import {
  addExecutionResult,
  AnySelector,
  createSelector,
  createSelectorContext,
  createStateSelector,
  Selector,
  SelectorContext,
} from './selector';
import { findExecutionResult } from './find-execution-result';
import { SelectorExecutionResultsMap } from './selector-execution-results-map';
import { SelectorExecutionResult } from './selector-execution-result';
import { createSelectorExecutionResultsCacheFromMap } from './selector-execution-results-cache';
import { areArgsEqual } from './are-args-equal';

interface State {
  foo: string;
  bar: string;
}

type Case = 'uppercase' | 'lowercase' | 'flipcase';

const hasRuns: AnySelector<any, any, any>[] = [];

const selectFoo = createStateSelector((state: State) => {
  hasRuns.push(selectFoo);
  return state.foo;
});
const selectBar = createStateSelector((state: State) => {
  hasRuns.push(selectBar);
  return state.bar;
});

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
    hasRuns.push(selectCasedFoo);
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
    hasRuns.push(selectCasedBar);
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
    hasRuns.push(selectCasedFooBar);
    return selectCasedFoo(ctx, fooCase) + selectCasedBar(ctx, barCase);
  }
);

interface TestSelectorExecutionResult<
  TState,
  TResult = any,
  TArgs extends any[] = any[]
> extends SelectorExecutionResult<TState, TResult, TArgs> {
  hasRun: boolean;
  inputs: TestSelectorExecutionResult<TState>[];
}

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
  inputs?: TestSelectorExecutionResult<TState>[];
}): TestSelectorExecutionResult<TState, TResult, TArgs> {
  return {
    selector,
    args,
    result,
    hasRun,
    inputs,
  };
}

function createExecutionResultsMap<TState>(
  rootExecutionResult: TestSelectorExecutionResult<TState>
) {
  const executionResultsMap: SelectorExecutionResultsMap<TState> = new Map();

  function visit(executionResult: TestSelectorExecutionResult<TState>) {
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
  prevExecutionResult?: TestSelectorExecutionResult<State>;
  state: State;
  executionResult: TestSelectorExecutionResult<State>;
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

function fail(message: string, a: any, b: any): never {
  throw new Error(
    `${message}. a: ${JSON.stringify(a)}, b: ${JSON.stringify(b)}`
  );
}

function verifyExecutionResultsEqual(
  map: SelectorExecutionResultsMap<State>,
  a: SelectorExecutionResult<State>,
  b: TestSelectorExecutionResult<State>,
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

  const aHasRun = hasRuns.includes(a.selector);
  if (aHasRun !== b.hasRun) {
    fail(`hasRuns are different at ${path}`, aHasRun, b.hasRun);
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
    const aExecutionResult = findExecutionResult(
      map,
      aInput.selector,
      aInput.args
    );
    if (aExecutionResult === undefined) {
      fail(`executionResult not found for input at ${path}`, aInput, bInput);
    }

    verifyExecutionResultsEqual(map, aExecutionResult, bInput, `${path}.${i}`);
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
      hasRuns.length = 0;
      const ctx = createSelectorContext(
        testCase.state,
        testCase.prevExecutionResult !== undefined
          ? createSelectorExecutionResultsCacheFromMap(
              createExecutionResultsMap(testCase.prevExecutionResult)
            )
          : undefined
      );
      const executionResult = ctx.runSelector(
        testCase.executionResult.selector as Selector<any, any, any>,
        testCase.executionResult.args
      );

      verifyExecutionResultsEqual(
        ctx.getExecutionResultsMap(),
        executionResult,
        testCase.executionResult
      );
      verifyExecutionResultsMapEqual(
        ctx.getExecutionResultsMap(),
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
