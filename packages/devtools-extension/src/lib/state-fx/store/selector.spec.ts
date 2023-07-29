import { createSelector, createSelectorFunction, createStateSelector, SelectorContext, SelectorFunction, StateSelectorFunction } from './selector';
import * as stream from 'stream';
import { factory } from 'ts-jest/dist/transformers/hoist-jest';

interface Todo {
  id: number;
  name: string;
  done: boolean;
  tasks: string[];
}

interface State {
  currentTodoId: number | undefined;
  todos: Todo[];
}

const todo1: Todo = {
  id: 1,
  name: 'todo 1',
  done: true,
  tasks: ['do this', 'do that'],
};

const todo2: Todo = {
  id: 2,
  name: 'todo 2',
  done: false,
  tasks: [],
};

const stateTodo1: State = {
  currentTodoId: todo1.id,
  todos: [todo1, todo2],
};

const stateTodo2: State = {
  currentTodoId: todo2.id,
  todos: [todo1, todo2],
};

const stateTodoUndefined: State = {
  currentTodoId: undefined,
  todos: [todo1, todo2],
};

interface CallSpec<STATE = any, ARGS extends any[] = any[], RESULT = any, FNS extends string = string> {
  description: string;
  state: STATE;
  args: ARGS;
  expectedResult: RESULT;
  expectedFnRuns: { [FN in FNS]: number };
  calls?: CallSpec<STATE, ARGS, RESULT, FNS>[];
}

class Listing {
  private records: Record<string, number> = {};

  record(fn: string): void {
    if (fn in this.records) {
      this.records[fn] += 1;
    } else {
      this.records[fn] = 1;
    }
  }

  reset(): void {
    this.records = {};
  }

  get(fn: string) {
    return this.records[fn] ?? 0;
  }
}

interface TestSpec<STATE = any, ARGS extends any[] = any[], RESULT = any, FNS extends string = string> {
  description: string;
  factory: (listing?: Listing) => StateSelectorFunction<STATE, ARGS, RESULT>;
  calls: CallSpec<STATE, ARGS, RESULT, FNS>[];
}

const testsWithoutArgs: TestSpec<State, [], Todo | undefined, 'selectCurrentTodoId' | 'selectTodos' | 'selectCurrentTodo'>[] = [
  {
    description: 'without args',
    factory: createGetCurrentTodo,
    calls: [
      {
        description: 'first call',
        state: stateTodo1,
        args: [],
        expectedResult: todo1,
        expectedFnRuns: {
          selectCurrentTodo: 1,
          selectTodos: 1,
          selectCurrentTodoId: 1,
        },
        calls: [
          {
            description: 'second call when state is the same',
            state: stateTodo1,
            args: [],
            expectedResult: todo1,
            expectedFnRuns: {
              selectCurrentTodo: 0,
              selectTodos: 0,
              selectCurrentTodoId: 0,
            },
          },
          {
            description: 'second call when state is different',
            state: stateTodo2,
            args: [],
            expectedResult: todo2,
            expectedFnRuns: {
              selectCurrentTodo: 1,
              selectTodos: 1,
              selectCurrentTodoId: 1,
            },
          },
          {
            description: 'second call when state is different but inputs are the same',
            state: { ...stateTodo1 },
            args: [],
            expectedResult: todo1,
            expectedFnRuns: {
              selectCurrentTodo: 0,
              selectTodos: 1,
              selectCurrentTodoId: 1,
            },
          },
          {
            description: 'second call when state is different and some inputs are not used anymore',
            state: stateTodoUndefined,
            args: [],
            expectedResult: undefined,
            expectedFnRuns: {
              selectCurrentTodo: 1,
              selectTodos: 0,
              selectCurrentTodoId: 1,
            },
          },
        ],
      },
    ],
  },
];

const testsWithArgs: TestSpec<State, [number | undefined], Todo | undefined, 'selectTodos' | 'selectTodoById'>[] = [
  {
    description: 'with args',
    factory: createGetTodoById,
    calls: [
      {
        description: 'first call',
        state: stateTodo1,
        args: [todo1.id],
        expectedResult: todo1,
        expectedFnRuns: {
          selectTodos: 1,
          selectTodoById: 1,
        },
        calls: [
          {
            description: 'second call when state is the same and args are the same',
            state: stateTodo1,
            args: [todo1.id],
            expectedResult: todo1,
            expectedFnRuns: {
              selectTodos: 0,
              selectTodoById: 0,
            },
          },
          {
            description: 'second call when state is different',
            state: stateTodo2,
            args: [todo1.id],
            expectedResult: todo1,
            expectedFnRuns: {
              selectTodos: 1,
              selectTodoById: 1,
            },
          },
          {
            description: 'second call when state is different but inputs are the same',
            state: { ...stateTodo1 },
            args: [todo1.id],
            expectedResult: todo1,
            expectedFnRuns: {
              selectTodos: 1,
              selectTodoById: 0,
            },
          },
          {
            description: 'second call when args are different',
            state: stateTodo1,
            args: [todo2.id],
            expectedResult: todo2,
            expectedFnRuns: {
              selectTodos: 0,
              selectTodoById: 1,
            },
          },
          {
            description: 'second call when state and args are different',
            state: stateTodo2,
            args: [todo2.id],
            expectedResult: todo2,
            expectedFnRuns: {
              selectTodos: 1,
              selectTodoById: 1,
            },
          },
          {
            description: 'second call when state and args are different and some inputs are not used anymore',
            state: stateTodoUndefined,
            args: [undefined],
            expectedResult: undefined,
            expectedFnRuns: {
              selectTodos: 0,
              selectTodoById: 1,
            },
          },
        ],
      },
    ],
  },
];

function collectCallChains(callChains: CallSpec[][], call: CallSpec, parentCallChain: CallSpec[] = []) {
  const callChain = [...parentCallChain, call];
  callChains.push(callChain);
  if (call.calls) {
    for (let childCall of call.calls) {
      collectCallChains(callChains, childCall, callChain);
    }
  }
}

function createSpec(test: TestSpec) {
  describe(test.description, () => {
    const callChains: CallSpec[][] = [];
    for (let call of test.calls) {
      collectCallChains(callChains, call);
    }
    for (let callChain of callChains) {
      const targetCall = callChain.at(-1)!;
      describe(targetCall.description, () => {
        it('should return correct result', () => {
          const target = test.factory();
          let result: any;
          for (let call of callChain) {
            result = target(call.state, ...call.args);
          }
          expect(result).toEqual(targetCall.expectedResult);
        });
        it('should only run functions if needed', () => {
          const listing = new Listing();
          const target = test.factory(listing);
          for (let call of callChain) {
            listing.reset();
            target(call.state, ...call.args);
          }
          for (let fn in targetCall.expectedFnRuns) {
            expect(listing.get(fn), fn).toEqual(targetCall.expectedFnRuns[fn]);
          }
        });
      });
    }
  });
}

function createSpecs(tests: TestSpec[]) {
  for (let test of tests) {
    createSpec(test);
  }
}

function createGetCurrentTodo(listing?: Listing) {
  const selectCurrentTodoId = createStateSelector((state: State) => {
    listing?.record('selectCurrentTodoId');
    return state.currentTodoId;
  });
  const selectTodos = createStateSelector((state: State) => {
    listing?.record('selectTodos');
    return state.todos;
  });
  const selectCurrentTodo = createSelector((context: SelectorContext<State>) => {
    listing?.record('selectCurrentTodo');
    const currentTodoId = selectCurrentTodoId(context);
    if (currentTodoId === undefined) {
      return undefined;
    } else {
      const todos = selectTodos(context);
      return todos.find((todo) => todo.id === currentTodoId);
    }
  });

  return createSelectorFunction(selectCurrentTodo);
}

function createGetTodoById(listing?: Listing) {
  const selectTodos = createStateSelector((state: State) => {
    listing?.record('selectTodos');
    return state.todos;
  });
  const selectTodoById = createSelector((context: SelectorContext<State>, todoId: number | undefined) => {
    listing?.record('selectTodoById');
    if (todoId === undefined) {
      return undefined;
    } else {
      const todos = selectTodos(context);
      return todos.find((todo) => todo.id === todoId);
    }
  });

  return createSelectorFunction(selectTodoById);
}

describe('selector', () => {
  createSpecs([...testsWithArgs, ...testsWithoutArgs]);
  // describe('without args', () => {
  //   describe('when called for the first time', () => {
  //     it('should return correct value', () => {
  //       // given
  //       const state: State = {
  //         currentTodoId: todo1.id,
  //         todos: [todo1, todo2],
  //       };
  //
  //       const getCurrentTodo = createGetCurrentTodo();
  //
  //       // when
  //       const result = getCurrentTodo(state);
  //
  //       // then
  //       expect(result).toBe(todo1);
  //     });
  //   });
  //   describe('when called for the second time with same state', () => {
  //     it('should return correct value', () => {
  //       // given
  //       const state: State = {
  //         currentTodoId: todo1.id,
  //         todos: [todo1, todo2],
  //       };
  //
  //       const getCurrentTodo = createGetCurrentTodo();
  //       getCurrentTodo(state);
  //
  //       // when
  //       const result = getCurrentTodo(state);
  //
  //       // then
  //       expect(result).toBe(todo1);
  //     });
  //
  //     it('should not run the function', () => {
  //       // given
  //       const state: State = {
  //         currentTodoId: todo1.id,
  //         todos: [todo1, todo2],
  //       };
  //
  //       const listing: string[] = [];
  //       const getCurrentTodo = createGetCurrentTodo(listing);
  //       getCurrentTodo(state);
  //       listing.length = 0;
  //
  //       // when
  //       getCurrentTodo(state);
  //
  //       // then
  //       expect(listing).toEqual([]);
  //     });
  //   });
  //   describe('when called for the second time with different state', () => {
  //     it('should return correct value', () => {
  //       // given
  //       const state1: State = {
  //         currentTodoId: todo1.id,
  //         todos: [todo1, todo2],
  //       };
  //       const state2: State = {
  //         currentTodoId: todo2.id,
  //         todos: [todo1, todo2],
  //       };
  //
  //       const getCurrentTodo = createGetCurrentTodo();
  //       getCurrentTodo(state1);
  //
  //       // when
  //       const result = getCurrentTodo(state2);
  //
  //       // then
  //       expect(result).toBe(todo2);
  //     });
  //     it('should not run the function if the inputs did not change', () => {});
  //   });
  // });

  // describe('with args', () => {
  //   describe('when called for the first time', () => {
  //     it('should return correct value', () => {});
  //   });
  //   describe('when called for the second time with same state', () => {
  //     it('should return correct value', () => {});
  //   });
  //   describe('when called for the second time with different state', () => {
  //     it('should return correct value', () => {});
  //   });
  //   describe('when called for the second time with same args', () => {});
  //   describe('when called for the second time with different args', () => {});
  //
  //   // should not run the function if the args and inputs are the same
  // });
});

// should not run the function if it's not needed anymore
