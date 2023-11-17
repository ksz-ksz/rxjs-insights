import { createSelection } from '../store/selection';
import { concat, concatMap, merge, Observable, of } from 'rxjs';
import {
  Action,
  ActionType,
  ActionTypeFn,
  ActionTypeFns,
  ActionTypes,
  Component,
  createContainer,
  createSelectorFunction,
  Deps,
  SelectorContext,
  Store,
  StoreComponent,
} from '@lib/state-fx/store';
import { createSuperSelector, SuperSelector } from '../store/super-selector';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';

type ResourceKey<T = unknown> = {
  _type: never & T;
  key: string;
};

type ResourceKeysMap<T> = {
  [K in keyof T]: ResourceKey<T[K]>;
};

type QueryKeyFactory<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): ResourceKey<ReturnType<T>>;
};

type QueryKeyFactories<T extends { [key: string]: (...args: any[]) => any }> = {
  [K in keyof T]: QueryKeyFactory<T[K]>;
};

interface QuerySpec<T = unknown> {
  key: string;
  args: any[];
}

type QuerySpecFactory<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): QuerySpec<ReturnType<T>>;
};

type QuerySpecFactories<T extends { [key: string]: (...args: any[]) => any }> =
  {
    [K in keyof T]: QuerySpecFactory<T[K]>;
  };

type MutationKeyFactory<T extends (...args: any[]) => any> = {
  (mutatorKey: string): ResourceKey<ReturnType<T>>;
};

type MutationKeyFactories<
  T extends { [key: string]: (...args: any[]) => any }
> = {
  [K in keyof T]: MutationKeyFactory<T[K]>;
};

interface ResourceKeys<
  TQueries extends { [key: string]: (...args: any[]) => any },
  TMutations extends { [key: string]: (...args: any[]) => any }
> {
  query: ResourceKeysMap<TQueries>;
  mutation: ResourceKeysMap<TMutations>;
  // query: QueryKeyFactories<TQueries>;
  // querySpec: QuerySpecFactories<TQueries>;
  // mutation: QueryKeyFactories<TMutations>;
  // mutationSpec: QueryKeyFactories<TMutations>;
}

function createResourceKeys<
  TQueries extends { [key: string]: (...args: any[]) => any },
  TMutations extends { [key: string]: (...args: any[]) => any }
>(): ResourceKeys<TQueries, TMutations> {
  return undefined as any;
}

interface InactiveQueryOptions {
  cacheTime?: number;
}

interface QueryOptions {
  cacheTime?: number;
  staleTime?: number;
}

interface MutationOptions {
  cacheTime?: number;
}

type Fn = (...args: any[]) => any;

type SetQueryData<T extends Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  queryData: ReturnType<T>;
  queryOptions?: InactiveQueryOptions;
};

type PreloadQuery<T extends Fn> = {
  subscriberKey: string;
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  queryOptions?: InactiveQueryOptions;
};

type Query<T extends Fn> = {
  subscriberKey: string;
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  queryOptions?: InactiveQueryOptions;
};

type InvalidateQueries = {
  queryKeys: ResourceKey[];
};

type CancelQueries = {
  queryKeys: ResourceKey[];
};

type SubscribeQuery<T extends Fn> = {
  subscriberKey: string;
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  queryOptions?: QueryOptions;
};

type UnsubscribeQuery<T extends Fn> = {
  subscriberKey: string;
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
};

type QuerySubscribed<T extends Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
};

type QueryUnsubscribed<T extends Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
};

type QueryStarted<T extends Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
};

type QueryCompleted<T extends Fn> = {
  queryKey: ResourceKey<T>;
  queryArgs: Parameters<T>;
  queryResult: Result<ReturnType<T>>;
};

type SubscribeMutation = {
  mutatorKey: string;
  mutationKey: ResourceKey;
  mutationOptions?: MutationOptions;
};

type UnsubscribeMutation = {
  mutatorKey: string;
  mutationKey: ResourceKey;
};

type Mutate<T extends Fn> = {
  mutatorKey: string;
  mutationKey: ResourceKey<T>;
  mutationArgs: Parameters<T>;
};

type MutationStarted<T extends Fn> = {
  mutatorKey: string;
  mutationKey: ResourceKey<T>;
  mutationArgs: Parameters<T>;
};

type MutationCompleted<T extends Fn> = {
  mutatorKey: string;
  mutationKey: ResourceKey<T>;
  mutationArgs: Parameters<T>;
  mutationResult: Result<ReturnType<T>>;
};

interface ResourceActions {
  // cache manipulation
  query<T extends Fn>(payload: Query<T>): Action<Query<T>>;
  preloadQuery<T extends Fn>(payload: PreloadQuery<T>): Action<PreloadQuery<T>>;
  setQueryData<T extends Fn>(payload: SetQueryData<T>): Action<SetQueryData<T>>;
  invalidateQueries(payload: InvalidateQueries): Action<InvalidateQueries>;
  cancelQueries(payload: CancelQueries): Action<CancelQueries>;
  // queries activation
  subscribeQuery<T extends Fn>(
    payload: SubscribeQuery<T>
  ): Action<SubscribeQuery<T>>;
  unsubscribeQuery<T extends Fn>(
    payload: UnsubscribeQuery<T>
  ): Action<UnsubscribeQuery<T>>;
  // queries lifecycle
  querySubscribed<T extends Fn>(
    payload: QuerySubscribed<T>
  ): Action<QuerySubscribed<T>>;
  queryUnsubscribed<T extends Fn>(
    payload: QueryUnsubscribed<T>
  ): Action<QueryUnsubscribed<T>>;
  queryStarted<T extends Fn>(payload: QueryStarted<T>): Action<QueryStarted<T>>;
  queryCompleted<T extends Fn>(
    payload: QueryCompleted<T>
  ): Action<QueryCompleted<T>>;
  // mutations activation
  subscribeMutation(payload: SubscribeMutation): Action<SubscribeMutation>;
  unsubscribeMutation(
    payload: UnsubscribeMutation
  ): Action<UnsubscribeMutation>;
  mutate<T extends Fn>(payload: Mutate<T>): Action<Mutate<T>>;
  // mutations lifecycle
  mutationStarted<T extends Fn>(
    payload: MutationStarted<T>
  ): Action<MutationStarted<T>>;
  mutationCompleted<T extends Fn>(
    payload: MutationCompleted<T>
  ): Action<MutationCompleted<T>>;
}

interface ResourceActionTypes extends ActionTypeFns<ResourceActions> {}

function createResourceActions(): ResourceActionTypes {
  return undefined as any;
}

interface QuerySubscriber {
  subscriberKey: string;
  options: QueryOptions;
}

interface QueryStateBase {
  queryKey: string;
  queryArgs: any[];
  subscribers: QuerySubscriber[];
  state: 'active' | 'inactive';
  cleanupTimestamp: number | undefined;
}

interface QueryStateInitial extends QueryStateBase {
  status: 'initial';
  data: undefined;
  error: undefined;
  lastDataTimestamp: undefined;
  lastErrorTimestamp: undefined;
}

interface QueryStateInitialData<T = unknown> extends QueryStateBase {
  status: 'initial-data';
  data: T;
  error: undefined;
  lastDataTimestamp: undefined;
  lastErrorTimestamp: undefined;
}

interface QueryStateQueryData<T = unknown> extends QueryStateBase {
  status: 'query-data';
  data: T;
  error: undefined;
  lastDataTimestamp: number;
  lastErrorTimestamp: undefined;
}

interface QueryStateQueryError extends QueryStateBase {
  status: 'query-error';
  data: undefined;
  error: unknown;
  lastDataTimestamp: undefined;
  lastErrorTimestamp: number;
}

interface QueryStateQueryErrorData<T = unknown> extends QueryStateBase {
  status: 'query-error-data';
  data: T;
  error: unknown;
  lastDataTimestamp: number;
  lastErrorTimestamp: number;
}

type QueryState<T = unknown> =
  | QueryStateInitial
  | QueryStateInitialData<T>
  | QueryStateQueryData<T>
  | QueryStateQueryError
  | QueryStateQueryErrorData<T>;

interface MutationStateBase {
  mutationKey: string;
  mutationArgs: any[];
  mutatorKey: string;
  options: MutationOptions;
  state: 'active' | 'inactive';
  cleanupTimestamp: number | undefined;
}

interface MutationStateInitial extends MutationStateBase {
  status: 'initial';
  data: undefined;
  error: undefined;
  lastResultTimestamp: undefined;
}

interface MutationStateMutationData<T> extends MutationStateBase {
  status: 'mutation-data';
  data: T;
  error: undefined;
  lastResultTimestamp: number;
}

interface MutationStateMutationError extends MutationStateBase {
  status: 'mutation-data';
  data: undefined;
  error: unknown;
  lastResultTimestamp: number;
}

type MutationState<T = unknown> =
  | MutationStateInitial
  | MutationStateMutationData<T>
  | MutationStateMutationError;

interface ResourceState {
  queries: QueryState[];
  mutations: MutationState[];
}

function createResourceStore(
  actions: ActionTypes<ResourceActions>
): Component<Store<ResourceState>> {
  return undefined as any;
}

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

const todosResourceActions = createResourceActions();

// TODO: pass querykeys for type inference?
// TODO: initialData?
const todosResourceStore = createResourceStore(todosResourceActions);

type QuerySelector<T extends (...args: any[]) => any> = SuperSelector<
  { get(store: Component<Store<ResourceState>>): ResourceState },
  Parameters<T>,
  QueryState<ReturnType<T>>
>;

type QuerySelectors<T extends { [key: string]: (...args: any[]) => any }> = {
  [K in keyof T]: QuerySelector<T[K]>;
};

type MutationSelector<T extends (...args: any[]) => any> = SuperSelector<
  { get(store: Component<Store<ResourceState>>): ResourceState },
  [mutatorKey: string],
  ReturnType<T>
>;

type MutationSelectors<T extends { [key: string]: (...args: any[]) => any }> = {
  [K in keyof T]: MutationSelector<T[K]>;
};

function createResourceSelectors<
  TQueries extends { [key: string]: (...args: any[]) => any },
  TMutations extends { [key: string]: (...args: any[]) => any }
>(
  store: Component<Store<ResourceState>>,
  keys: ResourceKeys<TQueries, TMutations>
): {
  state: SuperSelector<
    { get(store: Component<Store<ResourceState>>): ResourceState },
    [],
    ResourceState
  >;
  queries: QuerySelectors<TQueries>;
  mutations: MutationSelectors<TMutations>;
} {
  return undefined as any;
}

const {
  state: selectTodosState,
  queries: { getTodos: todosQuerySelectors, getTodo: todoQuerySelectors },
  mutations: {
    addTodo: addTodoMutationSelectors,
    removeTodo: removeTodoMutationSelectors,
    updateTodo: updateTodoMutationSelectors,
  },
} = createResourceSelectors(todosResourceStore, todosResourceKeys);

// FIXME: do we need that specific selectors? alternative:

const { query: selectTodosQueryState, mutation: selectTodosMutationState } =
  createResourceSelectorsx(todosResourceStore);

selectTodosQueryState(todosQueryKeys.getTodos);

interface QueryDef<TQuery extends (...args: any[]) => any, TDeps> {
  query: TQuery;
}

interface QueryDefFn<TQuery extends (...args: any[]) => any, TDeps> {
  (args: Parameters<TQuery>, deps: TDeps): QueryDef<TQuery, TDeps>;
}

type QueriesDef<
  TQueries extends { [key: string]: (...args: any[]) => any },
  TDeps
> = {
  [K in keyof TQueries]: QueryDefFn<TQueries[K], TDeps>;
};

interface SuccessResult<T = unknown> {
  status: 'success';
  data: T;
}

interface FailureResult {
  status: 'failure';
  error: unknown;
}

type Result<T = unknown> = SuccessResult<T> | FailureResult;

interface MutationDef<TMutation extends (...args: any[]) => any, TDeps> {
  mutate(
    args: Parameters<TMutation>,
    deps: TDeps
  ): Observable<ReturnType<TMutation>>;
  dispatch?(
    result: Observable<Result<ReturnType<TMutation>>>,
    args: Parameters<TMutation>,
    deps: TDeps
  ): Observable<Action>;
}

interface MutationDefFn<TMutation extends (...args: any[]) => any, TDeps> {
  (args: Parameters<TMutation>, deps: TDeps): MutationDef<TMutation, TDeps>;
}

type MutationsDef<
  TMutations extends { [key: string]: (...args: any[]) => any },
  TDeps
> = {
  [K in keyof TMutations]: MutationDef<TMutations[K], TDeps>;
};

function createResourceEffect<
  TQueries extends { [key: string]: (...args: any[]) => any },
  TMutations extends { [key: string]: (...args: any[]) => any },
  TDeps
>(
  options: {
    keys: ResourceKeys<TQueries, TMutations>;
    actions: ActionTypes<ResourceActions>;
    deps?: Deps<TDeps>;
  },
  queries: QueriesDef<TQueries, TDeps>,
  mutations: MutationsDef<TMutations, TDeps>
) {
  return undefined as any;
}

const todosResourceEffect = createResourceEffect(
  {
    keys: todosResourceKeys,
    actions: todosResourceActions,
    deps: {
      todos: createSelection(todosQuerySelectors),
      todo: createSelection(todoQuerySelectors),
    },
  },
  {
    getTodos() {
      return {
        query() {
          return todosClient.getTodos();
        },
      };
    },
    getTodo() {
      return {
        query(id: number) {
          return todosClient.getTodo(id);
        },
      };
    },
  },
  {
    addTodo: {
      mutate(args, deps) {
        const [name] = args;
        return fromPromise(todosClient.addTodo(name));
      },
      dispatch(result, args, deps) {
        const [name] = args;
        const todos = deps.todos.getResult();
        const optimisticTodo = { id: -1, name };
        const optimisticTodos = [...todos, optimisticTodo];
        return concat(
          of(
            todosResourceActions.cancelQueries({
              queryKeys: [todosQueryKeys.getTodos],
            }),
            todosResourceActions.setQueryData({
              queryKey: todosQueryKeys.getTodos,
              queryArgs: [],
              queryData: optimisticTodos,
            })
          ),
          result.pipe(
            concatMap((result) =>
              result.status === 'success'
                ? of(
                    todosResourceActions.invalidateQueries({
                      queryKeys: [todosQueryKeys.getTodos],
                    })
                  )
                : of(
                    todosResourceActions.setQueryData({
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

const todoQuery = createSelection(todoQuerySelectors);
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

const addTodoMutation = createSelection(addTodoMutationSelectors);
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
  useQuery<T extends (...args: any[]) => any>(
    key: ResourceKey<T>,
    args: Parameters<T>
  ): QueryState<ReturnType<T>>;
  useMutation<T extends (...args: any[]) => any>(
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
  preloadQuery<T extends Fn>(payload: PreloadQuery<T>): Observable<void>;
  setQueryData<T extends Fn>(payload: SetQueryData<T>): void;
  invalidateQueries(payload: InvalidateQueries): void;
  cancelQueries(payload: CancelQueries): void;
  // queries activation
  subscribeQuery<T extends Fn>(payload: SubscribeQuery<T>): void;
  unsubscribeQuery<T extends Fn>(payload: UnsubscribeQuery<T>): void;
  // mutations activation
  subscribeMutation(payload: SubscribeMutation): void;
  unsubscribeMutation(payload: UnsubscribeMutation): void;
  mutate<T extends Fn>(payload: Mutate<T>): Observable<MutationCompleted<T>>;
}
