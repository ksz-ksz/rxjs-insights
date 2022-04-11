import React, { useEffect } from 'react';
import { StoreProvider, useCommand, useQuery } from '@lib/store-react';
import { store } from '@app/store/store';
import { statusCommands, statusQueries } from '@app/store/status';

function Test() {
  const command = useCommand();
  useEffect(() => {
    setInterval(() => {
      command(
        statusCommands.SetTargetStatus({
          targetStatus: Math.random() > 0.5 ? 'connected' : 'disconnected',
        })
      );
    }, 1000);
  }, []);
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
