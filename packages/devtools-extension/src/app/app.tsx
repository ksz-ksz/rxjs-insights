import React, { PropsWithChildren } from 'react';
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
import { ContainerProvider } from '@lib/state-fx/store-react';
import { statusStore } from '@app/store/status/store';
import { statusEffect } from '@app/store/status/effect';
import { routerStore } from '@app/router';
import { routing } from '@app/routing';
import { traceStore } from '@app/store/trace/store';
import { inspectedWindowEffect } from '@app/store/inspected-window/effect';
import { navigationEffect } from '@app/store/navigation/effect';
import { targetsStore } from '@app/store/targets/store';
import { targetEffect } from '@app/store/targets/effect';
import { insightsStore } from '@app/store/insights/store';
import { insightsEffect } from '@app/store/insights/effect';
import { refsStore } from '@app/store/refs/store';
import { refsEffect } from '@app/store/refs/effect';
import { refreshRefsEffect } from '@app/store/refresh-refs/effect';
import { hoverTargetsEffect } from '@app/store/hover-targets/effect';
import { traceEffect } from '@app/store/trace/effect';
import { timeEffect } from '@app/store/time/effect';
import { refOutletContextEffect } from '@app/store/ref-outlet-context/effect';

APPLICATION_LOG.info('Devtools initialized');

function Providers(props: PropsWithChildren<{}>) {
  return (
    <ContainerProvider
      components={[
        routing,
        routerStore,
        statusStore,
        targetsStore,
        insightsStore,
        refsStore,
        traceStore,
        statusEffect,
        navigationEffect,
        inspectedWindowEffect,
        targetEffect,
        insightsEffect,
        refsEffect,
        refreshRefsEffect,
        hoverTargetsEffect,
        traceEffect,
        timeEffect,
        refOutletContextEffect,
      ]}
    >
      {props.children}
    </ContainerProvider>
  );
}

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Providers>
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
      </Providers>
    </ThemeProvider>
  );
}
