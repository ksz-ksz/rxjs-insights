import { map } from 'rxjs';
import { createState, transition } from './state';
import { createActions, typeOf } from '@lib/state-fx/store';
import { createStore, tx } from './store';
import { createEffect } from './effect';

const container = createContainer();

container.use();

const uiActions = createActions<{
  addTodoActionPerformed: {
    todoName: string;
  };
  removeTodoActionPerformed: {
    todoId: string;
  };
}>({ namespace: 'ui' });

const todoActions = createActions<{
  addTodo: {
    todoId: number;
    todoName: string;
  };
  removeTodo: {
    todoId: number;
  };
}>({ namespace: 'todo' });

const thisStore = createStore({
  namespace: 'this',
  state: { thisVal: 42 },
})([]);

const thatStore = createStore({
  namespace: 'that',
  state: { thatVal: 'what' },
})([]);

const todoEffect = createEffect({
  namespace: 'todo',
  deps: [thisStore, thatStore],
})({
  addTodo: (actions, depsView) => {
    return actions.ofType(uiActions.addTodoActionPerformed).pipe(
      map(({ payload: { todoName } }) =>
        todoActions.addTodo({
          todoId: getTodoId(),
          todoName: todoName,
        })
      )
    );
  },
  removeTodo: (actions) =>
    actions
      .ofType(uiActions.removeTodoActionPerformed)
      .pipe(map((todoId) => todoActions.removeTodo({ todoId: todoId }))),
});

interface TodoState {
  todos: string[];
}

const todoStore = createStore({
  namespace: 'todo',
  state: typeOf<TodoState>({ todos: [] }),
  deps: [thisStore, thatStore],
})({
  addTodo: tx(
    [todoActions.addTodo, todoActions.removeTodo],
    (state, action, deps) => {
      deps.this.thisVal;
      state.todos.push({ id: todoId, name: todoName });
    }
  ),
  removeTodo: tx([todoActions.removeTodo], (state, action) => {
    const indexOf = state.todos.findIndex((todo) => todo.id === todoId);
    if (indexOf !== -1) {
      state.todos.splice(indexOf, 1);
    }
  }),
});

const todoStore = createStore({
  namespace: 'todo',
  state: typeOf<TodoState>({ todos: [] }),
})([
  tx([todoActions.addTodo, todoActions.removeTodo], (state, action) => {
    state.todos.push({ id: todoId, name: todoName });
  }),
  tx([todoActions.removeTodo], (state, action) => {
    const indexOf = state.todos.findIndex((todo) => todo.id === todoId);
    if (indexOf !== -1) {
      state.todos.splice(indexOf, 1);
    }
  }),
]);

const otherStore = createStore({
  namespace: 'other',
  initialState: {
    value: 0,
  },
  transitions: {},
});

const storeView = createStoreView({
  deps: [todoState, otherState],
});

function Component() {
  const dispatch = useDispatch();
  const todos = useStore(todoStore, todoSelector);

  return (
    <div>
      <button
        onClick={() =>
          dispatch(uiActions.addTodoActionPerformed({ todoName: '...' }))
        }
      >
        add
      </button>
      <div>
        {todos.todos.map((todo) => (
          <div>
            <span>{todo.name}</span>
            <button
              onClick={() =>
                dispatch(
                  uiActions.removeTodoActionPerformed({ todoId: todo.id })
                )
              }
            >
              remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

container.register(todoStore);
container.register(otherStore);
container.register(storeView);
container.register(todoEffect);

function App() {
  return (
    <ContainerProvider>
      <Component />
    </ContainerProvider>
  );
}
