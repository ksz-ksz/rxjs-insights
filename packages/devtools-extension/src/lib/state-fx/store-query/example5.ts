import { createSelection } from '../store/selection';
import { concat, concatMap, Observable, of } from 'rxjs';
import {
  Component,
  createContainer,
  Store,
  StoreComponent,
} from '@lib/state-fx/store';
import { createSuperSelector, SuperSelector } from '../store/super-selector';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
import { Fn } from './fn';
import {
  createResourceKeys,
  CreateResourceKeysResult,
  ResourceKey,
} from './resource-key';
import {
  CancelQuery,
  createResourceActions,
  InvalidateQuery,
  Mutate,
  MutationCompleted,
  ForceQuery,
  Query,
  QueryCompleted,
  ResourceActionTypes,
  SetQuery,
  SubscribeMutation,
  SubscribeQuery,
  UnsubscribeMutation,
  UnsubscribeQuery,
} from './resource-actions';
import {
  createResourceStore,
  MutationState,
  QueryState,
  ResourceState,
} from './resource-store';
import { createResourceSelectors } from './resource-selectors';
import { createResourceEffect } from './resource-effect';

interface Todo {
  id: number;
  name: string;
}

const { query: todosQueryKeys, mutation: todosMutationKeys } =
  createResourceKeys<
    {
      getTodos(): Todo[];
      getTodo(id: number): Todo;
    },
    {
      addTodo(name: string): Todo;
      removeTodo(id: number): Todo;
      updateTodo(id: number, name: string): Todo;
    }
  >();

const todosResourceActions = createResourceActions('todos-resource');

// TODO: pass querykeys for type inference?
// TODO: initialData?
const todosResourceStore = createResourceStore(todosResourceActions);

type QuerySelector<T extends Fn> = SuperSelector<
  { get(store: Component<Store<ResourceState>>): ResourceState },
  Parameters<T>,
  QueryState<ReturnType<T>>
>;

type QuerySelectors<T extends { [key: string]: Fn }> = {
  [K in keyof T]: QuerySelector<T[K]>;
};

type MutationSelector<T extends Fn> = SuperSelector<
  { get(store: Component<Store<ResourceState>>): ResourceState },
  [mutatorKey: string],
  ReturnType<T>
>;

type MutationSelectors<T extends { [key: string]: Fn }> = {
  [K in keyof T]: MutationSelector<T[K]>;
};

const {
  selectQueryState: selectTodosQueryState,
  selectMutationState: selectTodosMutationState,
} = createResourceSelectors(todosResourceStore);

const todosClient: any = undefined;

const todosResourceEffect = createResourceEffect(
  {
    keys: {
      query: todosQueryKeys,
      mutation: todosMutationKeys,
    },
    actions: todosResourceActions,
    deps: {
      todos: createSelection(
        createSuperSelector([selectTodosQueryState], (ctx) =>
          selectTodosQueryState(ctx, todosQueryKeys.getTodos, [])
        )
      ),
      todo: createSelection(
        createSuperSelector([selectTodosQueryState], (ctx, id: number) =>
          selectTodosQueryState(ctx, todosQueryKeys.getTodo, [id])
        )
      ),
    },
  },
  {
    getTodos: {
      query() {
        return todosClient.getTodos();
      },
    },
    getTodo: {
      query([id]) {
        return todosClient.getTodo(id);
      },
    },
  },
  {
    addTodo: {
      mutate([name], deps) {
        return fromPromise(todosClient.addTodo(name));
      },
      dispatch(result, [name], deps) {
        const todos = deps.todos.getResult()?.data ?? [];
        const optimisticTodo = { id: -1, name };
        const optimisticTodos = [...todos, optimisticTodo];
        return concat(
          of(
            todosResourceActions.cancelQueries({
              queryKeys: [todosQueryKeys.getTodos],
            }),
            todosResourceActions.setQuery({
              queryKey: todosQueryKeys.getTodos,
              queryArgs: [],
              queryData: optimisticTodos,
            })
          ),
          result.pipe(
            concatMap((result) =>
              result.status === 'success'
                ? of(
                    todosResourceActions.invalidateQuery({
                      queryKeys: [todosQueryKeys.getTodos],
                    })
                  )
                : of(
                    todosResourceActions.setQuery({
                      queryKey: todosQueryKeys.getTodos,
                      queryArgs: [],
                      queryData: todos,
                    })
                  )
            )
          )
        );
      },
    },
    removeTodo: {
      mutate(args) {
        const [id] = args;
        return todosClient.removeTodo(id);
      },
    },
    updateTodo: {
      mutate(args) {
        const [id, name] = args;
        return todosClient.updateTodo(id, name);
      },
    },
  }
);

// ================= QUERY

const subscriberKey = crypto.randomUUID();

todosResourceActions.subscribeQuery({
  subscriberKey,
  queryKey: todosQueryKeys.getTodo,
  queryArgs: [7],
});

const selectTodoQuery = createSuperSelector(
  [selectTodosQueryState],
  (ctx, id: number) => selectTodosQueryState(ctx, todosQueryKeys.getTodo, [id])
);
const todoQuery = createSelection(selectTodoQuery);
createContainer().use(todoQuery).component.getResult(7);

todosResourceActions.unsubscribeQuery({
  subscriberKey,
  queryKey: todosQueryKeys.getTodo,
  queryArgs: [7],
});

// ================= MUTATION

const mutatorKey = crypto.randomUUID();

todosResourceActions.subscribeMutation({
  mutatorKey,
  mutationKey: todosMutationKeys.addTodo,
});

const selectAddTodoMutation = createSuperSelector(
  [selectTodosMutationState],
  (ctx, mutatorKey: string) =>
    selectTodosMutationState(ctx, todosMutationKeys.addTodo, mutatorKey)
);
const addTodoMutation = createSelection(selectAddTodoMutation);
createContainer().use(addTodoMutation).component.getResult(mutatorKey);

todosResourceActions.mutate({
  mutatorKey,
  mutationKey: todosMutationKeys.addTodo,
  mutationArgs: ['do this'],
});

todosResourceActions.unsubscribeMutation({
  mutatorKey,
  mutationKey: todosMutationKeys.addTodo,
});

interface ResourceHooks {
  useQuery<T extends Fn>(
    key: ResourceKey<T>,
    args: Parameters<T>
  ): QueryState<ReturnType<T>>;
  useMutation<T extends Fn>(
    key: ResourceKey<T>
  ): MutationState<ReturnType<T>> & { mutate(args: Parameters<T>): void };
}

// ========================= HOOKS
function createResourceHooks(
  store: StoreComponent<ResourceState>,
  actions: ResourceActionTypes
): ResourceHooks {
  return undefined as any;
}

const { useQuery: useTodosQuery, useMutation: useTodosMutation } =
  createResourceHooks(todosResourceStore, todosResourceActions);

const todosState = useTodosQuery(todosQueryKeys.getTodo, [7]);
const { mutate: addTodo, ...addTodoMutationState } = useTodosMutation(
  todosMutationKeys.addTodo
);
addTodo(['asd']);

// ============== RESOURCE

interface Resource {
  // cache manipulation
  query<T extends Fn>(payload: Query<T>): Observable<QueryCompleted<T>>;
  preloadQuery<T extends Fn>(payload: ForceQuery<T>): Observable<void>;
  setQueryData<T extends Fn>(payload: SetQuery<T>): void;
  invalidateQueries(payload: InvalidateQuery): void;
  cancelQueries(payload: CancelQuery): void;
  // queries activation
  subscribeQuery<T extends Fn>(payload: SubscribeQuery<T>): void;
  unsubscribeQuery<T extends Fn>(payload: UnsubscribeQuery<T>): void;
  // mutations activation
  subscribeMutation(payload: SubscribeMutation): void;
  unsubscribeMutation(payload: UnsubscribeMutation): void;
  mutate<T extends Fn>(payload: Mutate<T>): Observable<MutationCompleted<T>>;
}
