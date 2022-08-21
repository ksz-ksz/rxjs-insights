import React from 'react';
import { createTheme } from '@mui/material';
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
    custom: {
      sidePanelHeaderBackground: React.CSSProperties['color'];
    };
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
      caller: {
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
    custom: {
      sidePanelHeaderBackground: React.CSSProperties['color'];
    };
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
      caller: {
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

function creteDarkTheme() {
  return createTheme({
    custom: {
      sidePanelHeaderBackground: '#2F2F2F',
    },
    palette: {
      mode: 'dark',
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
      caller: {
        primary: orange['700'],
        secondary: orange['700'],
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
  });
}

function creteLightTheme() {
  return createTheme({
    custom: {
      sidePanelHeaderBackground: '#E0E0E0',
    },
    palette: {
      mode: 'light',
    },
    inspector: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      enumerable: pink['400'],
      nonenumerable: pink['300'],
      special: grey['700'],
      boolean: indigo['500'],
      number: indigo['500'],
      string: green['700'],
      symbol: grey['700'],
      function: red['700'],
      undefined: brown['700'],
      null: brown['700'],
    },
    insights: {
      observable: {
        primary: blue['600'],
        secondary: blue['400'],
      },
      subscriber: {
        primary: purple['600'],
        secondary: purple['400'],
      },
      caller: {
        primary: orange['900'],
        secondary: orange['900'],
      },
      event: {
        next: {
          primary: green['900'],
          secondary: green['600'],
        },
        error: {
          primary: red['900'],
          secondary: red['600'],
        },
        complete: {
          primary: lightBlue['900'],
          secondary: lightBlue['600'],
        },
        subscription: {
          primary: orange['900'],
          secondary: orange['900'],
        },
      },
    },
  });
}

const prefersDarkMode = chrome.devtools.panels.themeName === 'dark';
export const theme = prefersDarkMode ? creteDarkTheme() : creteLightTheme();
