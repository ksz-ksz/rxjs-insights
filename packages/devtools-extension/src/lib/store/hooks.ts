import { State, Store } from './store';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Action } from './action';
import { StoreContext } from './context';
import { Selector } from './selector';
import { SelectionObserver } from './selection-observer';

export function useStore<STATE>(): Store<STATE> {
  return useContext(StoreContext);
}

export function useDispatch() {
  const store = useStore();
  return useCallback((action: Action) => store.dispatch(action), [store]);
}

export function useSelector<STATE, RESULT>(
  selector: Selector<STATE, RESULT>
): RESULT {
  const store = useStore<STATE>();
  const selection = useMemo(() => selector.selection(), [selector]);
  const [result, setResult] = useState<RESULT>(() =>
    selection.get(store.get())
  );
  useEffect(() => {
    const subscription = store.subscribe(
      new SelectionObserver<STATE, RESULT>(selection, {
        next(value) {
          setResult(value);
        },
        error(err) {
          console.error('useSelector.error', selector, err);
          throw err;
        },
        complete() {},
      })
    );

    return () => subscription.unsubscribe();
  }, [selection]);

  return result;
}

export interface StoreHooks<STATE> {
  useStore(): Store<STATE>;
  useDispatch(): Store<STATE>['dispatch'];
  useSelector<RESULT>(selector: Selector<STATE, RESULT>): RESULT;
}

export function createStoreHooks<STORE extends Store<any>>(): StoreHooks<
  State<STORE>
> {
  return {
    useStore,
    useDispatch,
    useSelector,
  };
}
