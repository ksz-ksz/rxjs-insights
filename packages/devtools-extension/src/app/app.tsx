import React from 'react';
import { StoreProvider } from '@lib/store';
import { store } from '@app/store';
import { StatusPage } from './pages/status-page';

export function App() {
  return (
    <StoreProvider value={store}>
      <StatusPage />
    </StoreProvider>
  );
}
