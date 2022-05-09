import React from 'react';
import { StoreProvider } from '@lib/store';
import { store, useSelector } from '@app/store';
import { RouterOutlet } from '@lib/store-router';
import { router, routerSelectors } from '@app/store/router';

function RouterDebug() {
  const url = useSelector(routerSelectors.url);
  const routes = useSelector(routerSelectors.routes);
  return (
    <pre>
      <code>{JSON.stringify({ url, routes }, null, 2)}</code>
    </pre>
  );
}

export function App() {
  return (
    <StoreProvider value={store}>
      <RouterDebug />
      <RouterOutlet router={router} />
    </StoreProvider>
  );
}
