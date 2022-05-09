import React from 'react';
import { StoreProvider } from '@lib/store';
import { store } from '@app/store';
import { RouterOutlet } from './components/router-outlet';

export function App() {
  return (
    <StoreProvider value={store}>
      <RouterOutlet />
    </StoreProvider>
  );
}
