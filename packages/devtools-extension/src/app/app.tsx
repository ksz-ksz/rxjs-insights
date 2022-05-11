import React from 'react';
import { StoreProvider } from '@lib/store';
import { store, useSelector } from '@app/store';
import { RouterOutlet } from '@lib/store-router';
import { router, routerSelectors } from '@app/store/router';

export function App() {
  return (
    <StoreProvider value={store}>
      <RouterOutlet router={router} />
    </StoreProvider>
  );
}
