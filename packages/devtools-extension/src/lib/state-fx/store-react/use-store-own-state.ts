import { Component, Store } from '@lib/state-fx/store';
import { useComponent } from './use-component';
import { useCallback } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

export function useStoreOwnState<TState>(component: Component<Store<TState>>) {
  const source = useComponent(component);

  const subscribe = useCallback(
    (callback: () => void) => {
      const subscription = source.getOwnStateObservable().subscribe(callback);
      return () => subscription.unsubscribe();
    },
    [source]
  );
  const getSnapshot = source.getOwnState;

  return useSyncExternalStore(subscribe, getSnapshot);
}
