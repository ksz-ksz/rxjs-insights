import React from 'react';
import { StoreProvider } from '@lib/store';
import { store } from '@app/store';
import { RouterOutlet } from '@lib/store-router';
import {
  appBarRouteToken,
  old_router,
  statusRouteToken,
} from '@app/old_router';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { AppBarWrapper } from '@app/pages/app-bar-wrapper';
import { InstrumentationStatusPage } from '@app/pages/instrumentation-status-page';
import { theme } from '@app/theme';
import { APPLICATION_LOG } from '@app/logger';

APPLICATION_LOG.info('Devtools initialized');

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StoreProvider value={store}>
        <RouterOutlet
          router={old_router}
          token={appBarRouteToken}
          component={AppBarWrapper}
        />
        <RouterOutlet
          router={old_router}
          token={statusRouteToken}
          component={InstrumentationStatusPage}
        />
      </StoreProvider>
    </ThemeProvider>
  );
}
