import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Component,
  ComponentRef,
  createSelectorFunction,
  Selector,
  StateSelectorFunction,
  Store,
  StoreView,
} from '@lib/state-fx/store';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import { useComponent } from './use-component';
import { SuperSelector } from '../store/super-selector';
import { useContainer } from './use-container';
import { createSelection } from '../store/selection';

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
    [source, ...args]
  );

  return useSyncExternalStore(subscribe, getSnapshot);
}

interface SuperSelectorData<TArgs extends any[], TResult> {
  selector: SuperSelector<any, TArgs, TResult>;
  fn: StateSelectorFunction<any, TArgs, TResult>;
  deps: ComponentRef<Store<string, any>>[];
}

export function useSuperSelectorFunction<TArgs extends any[], TResult>(
  selector: SuperSelector<any, TArgs, TResult>
): StateSelectorFunction<any, TArgs, TResult> {
  const container = useContainer();
  const selectorDataRef = useRef<SuperSelectorData<TArgs, TResult> | null>(
    null
  );

  let selectorData = selectorDataRef.current;
  if (selectorData === null) {
    selectorDataRef.current = {
      selector,
      fn: createSelectorFunction(selector),
      deps: selector.deps.map(container.use),
    };
  } else if (selectorData.selector !== selector) {
    const prevSelectorData = selectorData;
    selectorDataRef.current = {
      selector,
      fn: createSelectorFunction(selector),
      deps: selector.deps.map(container.use),
    };
    for (const dep of prevSelectorData.deps) {
      dep.release();
    }
  }

  useEffect(() => () => {}, []);

  return selectorData;
}

export function useSuperSelector<TArgs extends any[], TResult>(
  selector: SuperSelector<any, TArgs, TResult>,
  ...args: TArgs
): TResult {
  const selectionComponent = useMemo(
    () => createSelection(selector),
    [selector]
  );
  const selection = useComponent(selectionComponent);
  const subscribe = useCallback(
    (callback: () => void) => {
      const subscription = selection.subscribe(callback);
      return () => subscription.unsubscribe();
    },
    [selection]
  );
  const snapshot = useCallback(
    () => selection.getResult(...args),
    [selection, ...args]
  );
  return useSyncExternalStore(subscribe, snapshot);
}
