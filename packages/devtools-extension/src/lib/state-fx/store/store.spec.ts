import { createReducer } from './reducer';
import { typeOf } from './type-of';
import { createStore } from './store';
import { Action, createActions } from './action';
import { createEffect } from './effect';
import { ignoreElements, of, Subject, tap } from 'rxjs';

interface User {
  name: string;
  permissions: string[];
}

interface UserState {
  currentUser: undefined | User;
}

interface Todo {
  id: number;
  name: string;
}

interface TodosState {
  todos: Todo[];
}

function createTestStore() {
  const [userReducer, userActions] = createReducer({
    namespace: 'user',
    initialState: typeOf<UserState>({ currentUser: undefined }),
    reducers: {
      login(state, { user }: { user: User }) {
        state.currentUser = user;
      },
    },
  });

  const [todosReducer, todosActions] = createReducer({
    namespace: 'todos',
    initialState: typeOf<TodosState>({
      todos: [],
    }),
    reducers: {
      addTodo(state, { todo }: { todo: Todo }) {
        state.todos.push(todo);
      },
      removeTodo(state, { todoId }: { todoId: number }) {
        const index = state.todos.findIndex((todo) => todo.id === todoId);
        if (index !== -1) {
          state.todos.splice(index, 1);
        }
      },
    },
  });

  const store = createStore({
    reducers: (compose) => compose.add(userReducer).add(todosReducer),
  });

  return { store, userActions, todosActions };
}

describe('store', () => {
  describe('state', () => {
    it('should create initial state', () => {
      // given
      const { store } = createTestStore();

      // when
      const state = store.getState();

      // then
      expect(state).toEqual({
        user: { currentUser: undefined },
        todos: { todos: [] },
      });
    });

    it('should emit the state on subscribe', () => {
      // given
      const { store, userActions } = createTestStore();
      const listing: any[] = [];

      // when
      store.getStateObservable().subscribe({
        next(value) {
          listing.push(value);
        },
      });

      // then
      expect(listing).toEqual([
        {
          user: { currentUser: undefined },
          todos: { todos: [] },
        },
      ]);
    });

    describe('when action is handled by the reducer', () => {
      it('should not modify the previous state', function () {
        // given
        const { store, userActions } = createTestStore();
        const prevState = store.getState();

        // when
        store.dispatch(
          userActions.login({ user: { name: 'bob', permissions: ['read'] } })
        );

        // then
        expect(prevState).toEqual({
          user: { currentUser: undefined },
          todos: { todos: [] },
        });
      });

      it('should update the state ', function () {
        // given
        const { store, userActions } = createTestStore();

        // when
        store.dispatch(
          userActions.login({ user: { name: 'bob', permissions: ['read'] } })
        );

        // then
        const state = store.getState();
        expect(state).toEqual({
          user: { currentUser: { name: 'bob', permissions: ['read'] } },
          todos: { todos: [] },
        });
      });

      it('should emit a state update', function () {
        // given
        const { store, userActions } = createTestStore();
        const listing: any[] = [];
        store.getStateObservable().subscribe({
          next(value) {
            listing.push(value);
          },
        });
        listing.length = 0;

        // when
        store.dispatch(
          userActions.login({ user: { name: 'bob', permissions: ['read'] } })
        );

        // then
        expect(listing).toEqual([
          {
            user: { currentUser: { name: 'bob', permissions: ['read'] } },
            todos: { todos: [] },
          },
        ]);
      });
    });

    describe('when action is not handled by the reducer', () => {
      it('should not update the state ', function () {
        // given
        const { store } = createTestStore();
        const otherActions = createActions<{ otherAction: number }>({
          namespace: 'other',
        });

        // when
        store.dispatch(otherActions.otherAction(42));

        // then
        const state = store.getState();
        expect(state).toEqual({
          user: { currentUser: undefined },
          todos: { todos: [] },
        });
      });

      it('should not emit a state update', function () {
        // given
        const { store } = createTestStore();
        const otherActions = createActions<{ otherAction: number }>({
          namespace: 'other',
        });
        const listing: any[] = [];
        store.getStateObservable().subscribe({
          next(value) {
            listing.push(value);
          },
        });
        listing.length = 0;

        // when
        store.dispatch(otherActions.otherAction(42));

        // then
        expect(listing).toEqual([]);
      });
    });
  });

  describe('effect', () => {
    describe('when registered', () => {
      it('should forward the actions from store to effects', () => {
        // given
        const { store, userActions } = createTestStore();
        const listing: any[] = [];
        const effect = createEffect({
          namespace: 'test',
          effects: {
            scan: (actions) =>
              actions.pipe(
                tap({
                  next(value) {
                    listing.push(value);
                  },
                }),
                ignoreElements()
              ),
          },
        });
        store.registerEffect(effect);

        // when
        store.dispatch(
          userActions.login({ user: { name: 'bob', permissions: ['read'] } })
        );

        // then
        expect(listing).toEqual([
          {
            namespace: 'user',
            name: 'login',
            payload: { user: { name: 'bob', permissions: ['read'] } },
          },
        ]);
      });
      it('should update the store before forwarding action from store to effect', () => {
        // given
        const { store, userActions } = createTestStore();
        const listing: any[] = [];
        const effect = createEffect({
          namespace: 'test',
          effects: {
            scan: (actions, store) =>
              actions.pipe(
                tap({
                  next(value) {
                    listing.push(store.getState());
                  },
                }),
                ignoreElements()
              ),
          },
        });
        store.registerEffect(effect);

        // when
        store.dispatch(
          userActions.login({ user: { name: 'bob', permissions: ['read'] } })
        );

        // then
        expect(listing).toEqual([
          {
            user: { currentUser: { name: 'bob', permissions: ['read'] } },
            todos: { todos: [] },
          },
        ]);
      });
      it('should forward the actions from effects to store', () => {
        // given
        const { store, userActions } = createTestStore();
        const listing: any[] = [];
        const effect = createEffect({
          namespace: 'test',
          effects: {
            scan: (actions, store) =>
              actions.pipe(
                tap({
                  next(value) {
                    listing.push(value);
                  },
                }),
                ignoreElements()
              ),
            emit: () =>
              of(
                userActions.login({
                  user: { name: 'bob', permissions: ['read'] },
                })
              ),
          },
        });

        // when
        store.registerEffect(effect);

        // then
        expect(listing).toEqual([
          {
            namespace: 'user',
            name: 'login',
            payload: { user: { name: 'bob', permissions: ['read'] } },
          },
        ]);
      });
      it('should queue the actions', () => {
        // given
        const { store, todosActions } = createTestStore();
        const listing: any[] = [];
        const effect = createEffect({
          namespace: 'test',
          effects: {
            scan: (actions, store) =>
              actions.pipe(
                tap({
                  next(value) {
                    listing.push([value, store.getState()]);
                  },
                }),
                ignoreElements()
              ),
            emit: () =>
              of(
                todosActions.addTodo({ todo: { id: 0, name: 'zero' } }),
                todosActions.addTodo({ todo: { id: 1, name: 'one' } }),
                todosActions.addTodo({ todo: { id: 2, name: 'two' } })
              ),
          },
        });

        // when
        store.registerEffect(effect);

        // then
        expect(listing).toEqual([
          [
            {
              namespace: 'todos',
              name: 'addTodo',
              payload: { todo: { id: 0, name: 'zero' } },
            },
            {
              user: { currentUser: undefined },
              todos: { todos: [{ id: 0, name: 'zero' }] },
            },
          ],
          [
            {
              namespace: 'todos',
              name: 'addTodo',
              payload: { todo: { id: 1, name: 'one' } },
            },
            {
              user: { currentUser: undefined },
              todos: {
                todos: [
                  { id: 0, name: 'zero' },
                  { id: 1, name: 'one' },
                ],
              },
            },
          ],
          [
            {
              namespace: 'todos',
              name: 'addTodo',
              payload: { todo: { id: 2, name: 'two' } },
            },
            {
              user: { currentUser: undefined },
              todos: {
                todos: [
                  { id: 0, name: 'zero' },
                  { id: 1, name: 'one' },
                  { id: 2, name: 'two' },
                ],
              },
            },
          ],
        ]);
      });
    });
    describe('when unregistered', () => {
      it('should not forward the actions from store to effects', () => {
        // given
        const { store, userActions } = createTestStore();
        const listing: any[] = [];
        const effect = createEffect({
          namespace: 'test',
          effects: {
            scan: (actions) =>
              actions.pipe(
                tap({
                  next(value) {
                    listing.push(value);
                  },
                }),
                ignoreElements()
              ),
          },
        });
        store.registerEffect(effect).unsubscribe();

        // when
        store.dispatch(
          userActions.login({ user: { name: 'bob', permissions: ['read'] } })
        );

        // then
        expect(listing).toEqual([]);
      });
      it('should not forward the actions from effects to store', () => {
        // given
        const { store, userActions } = createTestStore();
        const listing: any[] = [];
        const scanEffect = createEffect({
          namespace: 'scan',
          effects: {
            scan: (actions, store) =>
              actions.pipe(
                tap({
                  next(value) {
                    listing.push(value);
                  },
                }),
                ignoreElements()
              ),
          },
        });
        const emitSubject = new Subject<Action<unknown>>();
        const emitEffect = createEffect({
          namespace: 'emit',
          effects: {
            emit: () => emitSubject,
          },
        });
        store.registerEffect(scanEffect);

        // when
        store.registerEffect(emitEffect).unsubscribe();
        emitSubject.next(
          userActions.login({ user: { name: 'bob', permissions: ['read'] } })
        );

        // then
        expect(listing).toEqual([]);
      });
    });
  });
});
