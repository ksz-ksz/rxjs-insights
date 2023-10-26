import { useCallback, useMemo } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import { useComponent } from './use-component';
import { SuperSelector } from '../store/super-selector';
import { createSelection } from '../store/selection';

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
