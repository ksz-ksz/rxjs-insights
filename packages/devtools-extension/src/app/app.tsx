import React from 'react';
import { StoreProvider } from '@lib/store';
import { store } from '@app/store';
import { RouterOutlet } from '@lib/store-router';
import { appBarRouteToken, router, statusRouteToken } from '@app/router';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { AppBarWrapper } from '@app/pages/app-bar-wrapper';
import { InstrumentationStatusPage } from '@app/pages/instrumentation-status-page';
import {
  blue,
  brown,
  green,
  grey,
  indigo,
  lightBlue,
  orange,
  pink,
  purple,
  red,
} from '@mui/material/colors';

declare module '@mui/material/styles' {
  interface Theme {
    inspector: {
      primary: React.CSSProperties['color'];
      secondary: React.CSSProperties['color'];
      enumerable: React.CSSProperties['color'];
      nonenumerable: React.CSSProperties['color'];
      special: React.CSSProperties['color'];
      boolean: React.CSSProperties['color'];
      number: React.CSSProperties['color'];
      string: React.CSSProperties['color'];
      symbol: React.CSSProperties['color'];
      function: React.CSSProperties['color'];
      undefined: React.CSSProperties['color'];
      null: React.CSSProperties['color'];
    };
    insights: {
      observable: {
        primary: React.CSSProperties['color'];
        secondary: React.CSSProperties['color'];
      };
      subscriber: {
        primary: React.CSSProperties['color'];
        secondary: React.CSSProperties['color'];
      };
      event: {
        next: {
          primary: React.CSSProperties['color'];
          secondary: React.CSSProperties['color'];
        };
        error: {
          primary: React.CSSProperties['color'];
          secondary: React.CSSProperties['color'];
        };
        complete: {
          primary: React.CSSProperties['color'];
          secondary: React.CSSProperties['color'];
        };
        subscription: {
          primary: React.CSSProperties['color'];
          secondary: React.CSSProperties['color'];
        };
      };
    };
  }

  interface ThemeOptions {
    inspector: {
      primary: React.CSSProperties['color'];
      secondary: React.CSSProperties['color'];
      enumerable: React.CSSProperties['color'];
      nonenumerable: React.CSSProperties['color'];
      special: React.CSSProperties['color'];
      boolean: React.CSSProperties['color'];
      number: React.CSSProperties['color'];
      string: React.CSSProperties['color'];
      symbol: React.CSSProperties['color'];
      function: React.CSSProperties['color'];
      undefined: React.CSSProperties['color'];
      null: React.CSSProperties['color'];
    };
    insights: {
      observable: {
        primary: React.CSSProperties['color'];
        secondary: React.CSSProperties['color'];
      };
      subscriber: {
        primary: React.CSSProperties['color'];
        secondary: React.CSSProperties['color'];
      };
      event: {
        next: {
          primary: React.CSSProperties['color'];
          secondary: React.CSSProperties['color'];
        };
        error: {
          primary: React.CSSProperties['color'];
          secondary: React.CSSProperties['color'];
        };
        complete: {
          primary: React.CSSProperties['color'];
          secondary: React.CSSProperties['color'];
        };
        subscription: {
          primary: React.CSSProperties['color'];
          secondary: React.CSSProperties['color'];
        };
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
        },
        inspector: {
          primary: '#fff',
          secondary: 'rgba(255, 255, 255, 0.7)',
          enumerable: pink['200'],
          nonenumerable: pink['100'],
          special: grey['500'],
          boolean: indigo['300'],
          number: indigo['300'],
          string: green['500'],
          symbol: grey['500'],
          function: red['500'],
          undefined: brown['500'],
          null: brown['500'],
        },
        insights: {
          observable: {
            primary: blue['400'],
            secondary: blue['200'],
          },
          subscriber: {
            primary: purple['400'],
            secondary: purple['200'],
          },
          event: {
            next: {
              primary: green['700'],
              secondary: green['400'],
            },
            error: {
              primary: red['700'],
              secondary: red['400'],
            },
            complete: {
              primary: lightBlue['700'],
              secondary: lightBlue['400'],
            },
            subscription: {
              primary: orange['700'],
              secondary: orange['700'],
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
