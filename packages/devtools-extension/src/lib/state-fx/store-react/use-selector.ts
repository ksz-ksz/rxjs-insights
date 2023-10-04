import { useCallback, useRef } from 'react';
import {
  Component,
  createSelectorFunction,
  Selector,
  StateSelectorFunction,
  StoreView,
} from '@lib/state-fx/store';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import { useComponent } from './use-component';

export function useSelectorFunction<TState, TArgs extends any[], TResult>(
  selector: Selector<TState, TArgs, TResult>
): StateSelectorFunction<TState, TArgs, TResult> {
  const selectorFunctionRef = useRef<StateSelectorFunction<
    TState,
    TArgs,
    TResult
  > | null>(null);

  if (selectorFunctionRef.current === null) {
    selectorFunctionRef.current = createSelectorFunction(selector);
  }

  return selectorFunctionRef.current;
}

export function useSelector<TState, TArgs extends any[], TResult>(
  component: Component<StoreView<TState>>,
  selector: Selector<TState, TArgs, TResult>,
  ...args: TArgs
): TResult {
  const source = useComponent(component);
  const selectorFunction = useSelectorFunction(selector);

  const subscribe = useCallback(
    (callback: () => void) => {
      const subscription = source.getStateObservable().subscribe(callback);
      return () => subscription.unsubscribe();
    },
    [source]
  );
  const getSnapshot = useCallback(
    () => selectorFunction(source.getState(), ...args),
    [source]
  );
  return useSyncExternalStore(subscribe, getSnapshot);
}
