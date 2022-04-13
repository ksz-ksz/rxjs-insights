import { State, Store } from './store';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Action } from './action';
import { Selector } from './selector';
import { first, map } from 'rxjs';
import { StoreContext } from './context';

function useStore<STATE>(): Store<STATE> {
  return useContext(StoreContext);
}

function useDispatch() {
  const store = useStore();
  return useCallback((action: Action) => store.dispatch(action), [store]);
}

function useSelector<STATE, RESULT>(selector: Selector<STATE, RESULT>): RESULT {
  const store = useStore<STATE>();
  const [result, setResult] = useState<RESULT>(() => {
    let initialState: RESULT;
    store.pipe(first(), map(selector.select)).subscribe({
      next(value) {
        initialState = value;
      },
      error(err) {
        throw err;
      },
    });
    return initialState!;
  });
  useEffect(() => {
    const subscription = store.pipe(map(selector.select)).subscribe({
      next(value) {
        setResult(value);
      },
      error(err) {
        throw err;
      },
    });

    return () => subscription.unsubscribe();
  }, [selector]);
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
