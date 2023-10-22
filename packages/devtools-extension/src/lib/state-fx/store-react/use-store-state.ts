import { Component, StoreView } from '@lib/state-fx/store';
import { useComponent } from './use-component';
import { useCallback } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

export function useStoreState<TState>(component: Component<StoreView<TState>>) {
  const source = useComponent(component);

  const subscribe = useCallback(
    (callback: () => void) => {
      const subscription = source.getStateObservable().subscribe(callback);
      return () => subscription.unsubscribe();
    },
    [source]
  );
  const getSnapshot = source.getState;

  return useSyncExternalStore(subscribe, getSnapshot);
}
