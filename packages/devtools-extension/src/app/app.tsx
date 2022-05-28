import React from 'react';
import { StoreProvider } from '@lib/store';
import { store } from '@app/store';
import { RouterOutlet } from '@lib/store-router';
import { appBarRouteToken, router, statusRouteToken } from '@app/router';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { AppBarWrapper } from '@app/pages/app-bar-wrapper';
import { InstrumentationStatusPage } from '@app/pages/instrumentation-status-page';
import { brown, green, grey, indigo, pink, red } from '@mui/material/colors';

declare module '@mui/material/styles' {
  interface Palette {
    inspector: {
      key: {
        enumerable: React.CSSProperties['color'];
        nonenumerable: React.CSSProperties['color'];
        special: React.CSSProperties['color'];
      };
      val: {
        main: React.CSSProperties['color'];
        boolean: React.CSSProperties['color'];
        number: React.CSSProperties['color'];
        string: React.CSSProperties['color'];
        symbol: React.CSSProperties['color'];
        function: React.CSSProperties['color'];
        undefined: React.CSSProperties['color'];
        null: React.CSSProperties['color'];
      };
    };
  }

  interface PaletteOptions {
    inspector: {
      key: {
        enumerable: React.CSSProperties['color'];
        nonenumerable: React.CSSProperties['color'];
        special: React.CSSProperties['color'];
      };
      val: {
        main: React.CSSProperties['color'];
        boolean: React.CSSProperties['color'];
        number: React.CSSProperties['color'];
        string: React.CSSProperties['color'];
        symbol: React.CSSProperties['color'];
        function: React.CSSProperties['color'];
        undefined: React.CSSProperties['color'];
        null: React.CSSProperties['color'];
      };
    };
  }
}

export function App() {
  const prefersDarkMode = chrome.devtools.panels.themeName === 'dark';

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          inspector: {
            key: {
              enumerable: pink['200'],
              nonenumerable: pink['100'],
              special: grey['500'],
            },
            val: {
              main: '#fff',
              boolean: indigo['500'],
              number: indigo['500'],
              string: green['500'],
              symbol: grey['500'],
              function: red['500'],
              undefined: brown['500'],
              null: brown['500'],
            },
          },
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
