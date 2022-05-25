import React from 'react';
import { StoreProvider } from '@lib/store';
import { store } from '@app/store';
import { RouterOutlet } from '@lib/store-router';
import { appBarRouteToken, router, statusRouteToken } from '@app/router';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { AppBarWrapper } from '@app/pages/app-bar-wrapper';
import { InstrumentationStatusPage } from '@app/pages/instrumentation-status-page';

export function App() {
  const prefersDarkMode = chrome.devtools.panels.themeName === 'dark';

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StoreProvider value={store}>
        <RouterOutlet
          router={router}
          token={appBarRouteToken}
          component={AppBarWrapper}
        />
        <RouterOutlet
          router={router}
          token={statusRouteToken}
          component={InstrumentationStatusPage}
        />
      </StoreProvider>
    </ThemeProvider>
  );
}
