import { createActions, typeOf } from './index';
import { createStore, tx } from './store';
import { createEffect } from './effect';
import { map, Observer } from 'rxjs';
import { createContainer } from './container';
import { actionsComponent } from './actions';

const fakeActions = createActions<{
  updateFoo: string;
  updateBar: string;
  result: {
    from: 'foo' | 'bar';
    value: string;
    deps: {
      foo: string;
      bar: string;
    };
  };
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
});

const barStore = createStore({
  namespace: 'bar',
  state: typeOf<string>('initial'),
})({
  update: tx([fakeActions.updateBar], (state, action) => {
    return action.payload;
  }),
});

const fakeEffect = createEffect({
  namespace: 'fake',
  deps: [fooStore, barStore],
})({
  handleFoo(actions, deps) {
    return actions.ofType(fakeActions.updateFoo).pipe(
      map((action) =>
        fakeActions.result({
          value: action.payload,
          from: 'foo',
          deps: deps.getState(),
        })
      )
    );
  },
  handleBar(actions, deps) {
    return actions.ofType(fakeActions.updateBar).pipe(
      map((action) =>
        fakeActions.result({
          value: action.payload,
          from: 'bar',
          deps: deps.getState(),
        })
      )
    );
  },
});

function createTestHarness() {
  const container = createContainer();
  const actionsRef = container.use(actionsComponent);
  const effectRef = container.use(fakeEffect);

  return {
    container,
    actions: actionsRef.component,
    effect: effectRef.component,
    effectRef,
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

describe('Effect', () => {
  it('should dispatch actions and have latest deps state', () => {
    const { actions } = createTestHarness();
    const observer = createObserver();

    actions.ofType(fakeActions.result).subscribe(observer);

    actions.dispatch(fakeActions.updateFoo('updated'));
    actions.dispatch(fakeActions.updateBar('updated'));

    expect(observer.listing).toEqual([
      [
        'N',
        fakeActions.result({
          value: 'updated',
          from: 'foo',
          deps: {
            foo: 'updated',
            bar: 'initial',
          },
        }),
      ],
      [
        'N',
        fakeActions.result({
          value: 'updated',
          from: 'bar',
          deps: {
            foo: 'updated',
            bar: 'updated',
          },
        }),
      ],
    ]);
  });

  describe('when released', () => {
    it('should unsubscribe from sources', () => {
      const { actions, effectRef } = createTestHarness();
      const observer = createObserver();

      actions.ofType(fakeActions.result).subscribe(observer);

      effectRef.release();

      actions.dispatch(fakeActions.updateFoo('updated'));
      actions.dispatch(fakeActions.updateBar('updated'));

      expect(observer.listing).toEqual([]);
    });
    it('should release deps', () => {
      const { actions, effectRef, container } = createTestHarness();
      const fooStoreRef = container.use(fooStore);
      const barStoreRef = container.use(barStore);
      const foo = fooStoreRef.component;
      const bar = barStoreRef.component;
      fooStoreRef.release();
      barStoreRef.release();

      effectRef.release();

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
