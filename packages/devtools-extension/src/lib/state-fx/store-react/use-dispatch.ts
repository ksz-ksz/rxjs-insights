import { useCallback } from 'react';
import { Action } from '../store/action';
import { useActions } from './use-actions';

export function useDispatch() {
  const actions = useActions();
  return useCallback((action: Action) => actions.dispatch(action), [actions]);
}
