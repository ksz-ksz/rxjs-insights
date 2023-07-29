import { useCallback, useRef } from 'react';
import {
  createSelectorFunction,
  Selector,
  StateSelectorFunction,
} from '@lib/state-fx/store';
import { useStore } from './use-store';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

export function useSelector<TState, TArgs extends any[], TResult>(
  selector: Selector<TState, TArgs, TResult>,
  ...args: TArgs
): TResult {
  const store = useStore<TState>();
  const selectorFunctionRef = useRef<
    StateSelectorFunction<TState, TArgs, TResult> | undefined
  >(undefined);
  const selectorFunction =
    selectorFunctionRef.current !== undefined
      ? selectorFunctionRef.current
      : (selectorFunctionRef.current = createSelectorFunction(selector));

  const subscribe = useCallback(
    (callback: () => void) => {
      const subscription = store.getStateObservable().subscribe(callback);
      return () => subscription.unsubscribe();
    },
    [store]
  );
  const getSnapshot = useCallback(
    () => selectorFunction(store.getState(), ...args),
    [store]
  );
  return useSyncExternalStore(subscribe, getSnapshot);
}
