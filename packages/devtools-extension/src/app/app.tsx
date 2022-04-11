import React from 'react';
import { StoreProvider, useQuery } from '@lib/store-react';
import { store } from '@app/store/store';
import { statusQueries } from '@app/store/status';

function Test() {
  const status = useQuery(statusQueries.targetStatus);
  return <span>{status}</span>;
}

export function App() {
  return (
    <StoreProvider value={store}>
      <Test />
    </StoreProvider>
  );
}
