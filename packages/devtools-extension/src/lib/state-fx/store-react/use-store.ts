import { useContext } from 'react';
import { StoreContext } from './store-context';
import { Store } from '@lib/state-fx/store';

export function useStore<TState>() {
  return useContext(StoreContext) as Store<TState>;
}
