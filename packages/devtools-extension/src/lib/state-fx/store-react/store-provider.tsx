import React from 'react';
import { Store } from '@lib/state-fx/store';
import { StoreContext } from './store-context';

export interface StoreProviderProps {
  store: Store<any>;
}

export function StoreProvider({
  store,
  children,
}: React.PropsWithChildren<StoreProviderProps>) {
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}
