import { createStore, tx } from './store';
import { createActions, typeOf } from '../state-fx/store';
import { createContainer } from './container';
import { Observer } from 'rxjs';
import { actionsComponent } from './actions';

const fakeActions = createActions<{
  updateFoo: string;
  updateBar: string;
  update: string;
  updateAll: string;
  updateByA: { a: string };
  updateByB: { b: string };
}>({
  namespace: 'fake',
});

const fooStore = createStore({
  namespace: 'foo',
  state: typeOf<string>('initial'),
})({
  update: tx([fakeActions.updateFoo], (state, action) => {
    return action.payload;
  }),
  updateAll: tx([fakeActions.updateAll], (state, action) => {
    return action.payload;
  }),
});

const barStore = createStore({
  namespace: 'bar',
  state: typeOf<string>('initial'),
})({
  update: tx([fakeActions.updateBar], (state, action) => {
    return action.payload;
  }),
  updateAll: tx([fakeActions.updateAll], (state, action) => {
    return action.payload;
  }),
});

interface FakeState {
  value: string;
  deps?: {
    foo: string;
    bar: string;
  };
}

const fakeStore = createStore({
  namespace: 'fake',
  state: typeOf<FakeState>({ value: 'initial' }),
  deps: [fooStore, barStore],
})({
  update: tx([fakeActions.update], (state, action, deps) => {
    state.deps = deps;
    state.value = action.payload;
  }),
  updateAll: tx([fakeActions.updateAll], (state, action, deps) => {
    state.deps = deps;
    state.value = action.payload;
  }),
  set: tx(
    [fakeActions.updateByA, fakeActions.updateByB],
    (state, action, deps) => {
      state.deps = deps;
      if (fakeActions.updateByA.is(action)) {
        state.value = action.payload.a;
      }
      if (fakeActions.updateByB.is(action)) {
        state.value = action.payload.b;
      }
    }
  ),
  appendA: tx([fakeActions.updateByA], (state, action, deps) => {
    state.deps = deps;
    state.value += '_' + action.payload.a;
  }),
  appendB: tx([fakeActions.updateByB], (state, action, deps) => {
    state.deps = deps;
    state.value += '_' + action.payload.b;
  }),
});

function createTestHarness() {
  const container = createContainer();
  const storeRef = container.use(fakeStore);
  const actionsRef = container.use(actionsComponent);
  return {
    store: storeRef.component,
    actions: actionsRef.component,
    storeRef,
    actionsRef,
    container,
  };
}

type Listing<T> = Array<['N', T] | ['E', any] | ['C']>;

function createObserver<T>(): Observer<T> & {
  listing: Listing<T>;
  clear: () => void;
} {
  const listing: Listing<T> = [];
  const clear = () => {
    listing.length = 0;
  };

  return {
    listing,
    clear,
    next(val) {
      listing.push(['N', val]);
    },
    error(err) {
      listing.push(['E', err]);
    },
    complete() {
      listing.push(['C']);
    },
  };
}

describe('Store', () => {
  describe('when initialized', () => {
    it('should have initial state', () => {
      const { store } = createTestHarness();

      expect(store.getState()).toEqual({
        fake: {
          value: 'initial',
        },
      });
    });
    it('should emit initial state when subscribed', () => {
      const { store } = createTestHarness();
      const observer = createObserver();
      store.getStateObservable().subscribe(observer);

      expect(observer.listing).toEqual([
        [
          'N',
          {
            fake: {
              value: 'initial',
            },
          },
        ],
      ]);
    });
  });
  describe('when updated', () => {
    it('should update state', () => {
      const { store, actions } = createTestHarness();

      actions.dispatch(fakeActions.update('updated'));

      expect(store.getState()).toEqual({
        fake: {
          value: 'updated',
          deps: {
            foo: 'initial',
            bar: 'initial',
          },
        },
      });
    });
    it('should emit state update', () => {
      const { store, actions } = createTestHarness();
      const observer = createObserver();
      store.getStateObservable().subscribe(observer);
      observer.clear();

      actions.dispatch(fakeActions.update('updated'));

      expect(observer.listing).toEqual([
        [
          'N',
          {
            fake: {
              value: 'updated',
              deps: {
                foo: 'initial',
                bar: 'initial',
              },
            },
          },
        ],
      ]);
    });

    describe('when multiple handlers are called for a single action', () => {
      it('should update state', () => {
        const { store, actions } = createTestHarness();

        actions.dispatch(fakeActions.updateByA({ a: 'updated' }));

        expect(store.getState()).toEqual({
          fake: {
            value: 'updated_updated',
            deps: {
              foo: 'initial',
              bar: 'initial',
            },
          },
        });
      });
      it('should emit state update only once', () => {
        const { store, actions } = createTestHarness();
        const observer = createObserver();
        store.getStateObservable().subscribe(observer);
        observer.clear();

        actions.dispatch(fakeActions.updateByA({ a: 'updated' }));

        expect(observer.listing).toEqual([
          [
            'N',
            {
              fake: {
                value: 'updated_updated',
                deps: {
                  foo: 'initial',
                  bar: 'initial',
                },
              },
            },
          ],
        ]);
      });
    });

    describe('when has deps', () => {
      it('should have access to deps latest states', () => {
        const { store, actions } = createTestHarness();

        actions.dispatch(fakeActions.updateFoo('foo'));
        actions.dispatch(fakeActions.updateBar('bar'));
        actions.dispatch(fakeActions.update('updated'));

        expect(store.getState()).toEqual({
          fake: {
            value: 'updated',
            deps: {
              foo: 'foo',
              bar: 'bar',
            },
          },
        });
      });
      it('should not emit on deps emissions', () => {
        const { store, actions } = createTestHarness();
        const observer = createObserver();
        store.getStateObservable().subscribe(observer);
        observer.clear();

        actions.dispatch(fakeActions.updateFoo('foo'));
        actions.dispatch(fakeActions.updateBar('bar'));

        expect(observer.listing).toEqual([]);
      });
      it('should not update state on deps updates', () => {
        const { store, actions } = createTestHarness();
        const observer = createObserver();
        store.getStateObservable().subscribe(observer);
        observer.clear();

        actions.dispatch(fakeActions.updateFoo('foo'));
        actions.dispatch(fakeActions.updateBar('bar'));

        expect(store.getState()).toEqual({
          fake: {
            value: 'initial',
          },
        });
      });

      describe('when deps handlers are called for the same action', () => {
        it('should have access to deps latest states', () => {
          const { store, actions } = createTestHarness();
          const observer = createObserver();
          store.getStateObservable().subscribe(observer);
          observer.clear();

          actions.dispatch(fakeActions.updateAll('updated'));

          expect(store.getState()).toEqual({
            fake: {
              value: 'updated',
              deps: {
                foo: 'updated',
                bar: 'updated',
              },
            },
          });
        });
        it('should emit state update only once', () => {
          const { store, actions } = createTestHarness();
          const observer = createObserver();
          store.getStateObservable().subscribe(observer);
          observer.clear();

          actions.dispatch(fakeActions.updateAll('updated'));

          expect(observer.listing).toEqual([
            [
              'N',
              {
                fake: {
                  value: 'updated',
                  deps: {
                    foo: 'updated',
                    bar: 'updated',
                  },
                },
              },
            ],
          ]);
        });
      });
    });

    describe('when released', () => {
      it('should unsubscribe from sources', () => {
        const { store, actions, storeRef } = createTestHarness();

        storeRef.release();

        actions.dispatch(fakeActions.update('updated'));

        expect(store.getState()).toEqual({
          fake: {
            value: 'initial',
          },
        });
      });

      it('should release deps', () => {
        const { actions, storeRef, container } = createTestHarness();
        const fooStoreRef = container.use(fooStore);
        const barStoreRef = container.use(barStore);
        const foo = fooStoreRef.component;
        const bar = barStoreRef.component;
        fooStoreRef.release();
        barStoreRef.release();

        storeRef.release();

        actions.dispatch(fakeActions.updateFoo('updated'));
        actions.dispatch(fakeActions.updateBar('updated'));

        expect(foo.getState()).toEqual({
          foo: 'initial',
        });
        expect(bar.getState()).toEqual({
          bar: 'initial',
        });
      });
    });
  });
});
