import React from 'react';
import { StoreProvider } from '@lib/store';
import { store, useSelector } from '@app/store';
import { statusSelectors } from '@app/store/status';

function Test() {
  const status = useSelector(statusSelectors.status);
  return <span>{status}</span>;
}

export function App() {
  return (
    <StoreProvider value={store}>
      <Test />
    </StoreProvider>
  );
}
