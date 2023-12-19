import { createActions, createEffectComponent } from './index';
import { map, Observer } from 'rxjs';
import { createContainer } from './container';
import { actionsComponent } from './actions';
import { createStoreComponent, StoreDef, tx } from './store';

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

const fooStoreComponent = createStoreComponent(
  (): StoreDef<string> => ({
    name: 'foo',
    state: 'initial',
    transitions: {
      update: tx([fakeActions.updateFoo], (state, action) => {
        return action.payload;
      }),
    },
  })
);

const barStoreComponent = createStoreComponent(
  (): StoreDef<string> => ({
    name: 'bar',
    state: 'initial',
    transitions: {
      update: tx([fakeActions.updateBar], (state, action) => {
        return action.payload;
      }),
    },
  })
);

const fakeEffect = createEffectComponent(
  ({ fooStore, barStore }) => ({
    name: 'fake',
    effects: {
      handleFoo(actions) {
        return actions.ofType(fakeActions.updateFoo).pipe(
          map((action) =>
            fakeActions.result({
              value: action.payload,
              from: 'foo',
              deps: { foo: fooStore.getState(), bar: barStore.getState() },
            })
          )
        );
      },
      handleBar(actions) {
        return actions.ofType(fakeActions.updateBar).pipe(
          map((action) =>
            fakeActions.result({
              value: action.payload,
              from: 'bar',
              deps: { foo: fooStore.getState(), bar: barStore.getState() },
            })
          )
        );
      },
    },
  }),
  {
    fooStore: fooStoreComponent,
    barStore: barStoreComponent,
  }
);

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
      const fooStoreRef = container.use(fooStoreComponent);
      const barStoreRef = container.use(barStoreComponent);
      const foo = fooStoreRef.component;
      const bar = barStoreRef.component;
      fooStoreRef.release();
      barStoreRef.release();

      effectRef.release();

      actions.dispatch(fakeActions.updateFoo('updated'));
      actions.dispatch(fakeActions.updateBar('updated'));

      expect(foo.getState()).toEqual('initial');
      expect(bar.getState()).toEqual('initial');
    });
  });
});
