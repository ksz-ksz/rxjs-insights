import { map } from 'rxjs';

const container = createContainer();

const uiActions = createActionSources<{
  addTodoActionPerformed: {
    todoName: string;
  };
  removeTodoActionPerformed: {
    todoId: string;
  };
}>({ namespace: 'ui' });

const todoActions = createActionSources<{
  addTodo: {
    todoId: number;
    todoName: string;
  };
  removeTodo: {
    todoId: number;
  };
}>({ namespace: 'todo' });

const todoEffect = createEffect({
  namespace: 'todo',
  // inputs: uiActions,
  inputs: {
    addTodoActionPerformed: uiActions.addTodoActionPerformed.asInput(),
  },
  output: todoActions,
  effects: {
    addTodo: (inputs, outputs) =>
      inputs.addTodoActionPerformed.pipe(
        map(({ todoName }) =>
          outputs.addTodo({
            todoId: getTodoId(),
            todoName: todoName,
          })
        )
      ),
    removeTodo: (inputs, outputs) =>
      inputs.removeTodoActionPerformed.pipe(
        map((todoId) => outputs.removeTodo({ todoId: todoId }))
      ),
  },
});

const todoState = createState({
  namespace: 'todo',
  initialState: {
    todos: [],
  },
  inputs: todoActions,
  transitions: {
    addTodo: transition(
      [todoActions.addTodo],
      (state, { todoId, todoName }) => {
        state.todos.push({ id: todoId, name: todoName });
      }
    ),
    removeTodo: (state, { todoId }) => {
      const indexOf = state.todos.findIndex((todo) => todo.id === todoId);
      if (indexOf !== -1) {
        state.todos.splice(indexOf, 1);
      }
    },
  },
});

const todoSelector = createStoreSelector(todoState);

const otherState = createState({
  namespace: 'other',
  initialState: {
    value: 0,
  },
  inputs: {},
  transitions: {},
});

const state = createStateView({
  deps: [todoState, otherState],
});

function Component() {
  const uiActions = useActions(UiActions);
  const todos = useStore(todoState, todoSelector);

  return (
    <div>
      <button
        onClick={() => uiActions.addTodoActionPerformed({ todoName: '...' })}
      >
        add
      </button>
      <div>
        {todos.todos.map((todo) => (
          <div>
            <span>{todo.name}</span>
            <button
              onClick={() =>
                uiActions.removeTodoActionPerformed({ todoId: todo.id })
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

function App() {
  return (
    <ContainerProvider>
      <Component />
    </ContainerProvider>
  );
}
