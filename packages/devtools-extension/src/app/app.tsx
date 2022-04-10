import React from 'react';
import { StoreProvider, useQuery } from '@lib/store-react';
import { queryTargetStatus, store } from '@app/store';

function Test() {
  const status = useQuery(queryTargetStatus);
  return <span>{status}</span>;
}

export function App() {
  return (
    <StoreProvider value={store}>
      <Test />
    </StoreProvider>
  );
}
