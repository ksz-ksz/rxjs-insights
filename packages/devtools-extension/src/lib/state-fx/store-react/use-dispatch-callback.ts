import { Action } from '@lib/state-fx/store';
import { useCallback } from 'react';
import { useDispatch } from './use-dispatch';

export function useDispatchCallback<T extends any[]>(
  callback: (...args: [...T]) => Action | undefined,
  deps: ReadonlyArray<any>
): (...args: [...T]) => void {
  const dispatch = useDispatch();
  return useCallback((...args) => {
    const action = callback(...args);
    if (action) {
      dispatch(action);
    }
  }, deps);
}