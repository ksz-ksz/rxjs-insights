import { AppBar, Box, IconButton, Tab, Tabs, Toolbar } from '@mui/material';
import React from 'react';
import { createUrl, RouterLink, RouterOutlet } from '@lib/store-router';
import { dashboardRouteToken, router, targetRouteToken } from '@app/router';
import { Close, Refresh } from '@mui/icons-material';
import { useDispatch, useSelector } from '@app/store';
import { appBarActions } from '@app/actions/app-bar-actions';
import { targetsSelector } from '@app/store/targets';
import { TargetPage } from '@app/pages/target-page';
import { DashboardPage } from '@app/pages/dashboard-page';
import { activeTargetIdSelector } from '@app/selectors/targets-selectors';
import { RefOutlet } from '@app/components/ref-outlet';

export function AppBarWrapper() {
  const dispatch = useDispatch();

  const targets = useSelector(targetsSelector).targets;
  const activeTargetId = useSelector(activeTargetIdSelector);

  return (
    <Box display="flex" height="100%" flexDirection="column">
      <AppBar color="transparent" position="static" sx={{ flex: '0 0 0' }}>
        <Toolbar>
          <Tabs
            value={activeTargetId ?? 'dashboard'}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="scrollable auto tabs example"
            sx={{ flexGrow: 1 }}
          >
            <Tab
              component={RouterLink}
              router={router}
              value="dashboard"
              to={createUrl(['dashboard'])}
              label="RxJS Insights"
            />
            {targets.map((target) => (
              <Tab
                component={RouterLink}
                router={router}
                value={target.id}
                to={createUrl(['target', String(target.id)])}
                label={
                  <Box>
                    <RefOutlet summary reference={target} />
                    <IconButton
                      size="small"
                      edge="start"
                      aria-label="close"
                      sx={{ ml: 1 }}
                    >
                      <Close
                        fontSize="inherit"
                        onClick={(e) => {
                          dispatch(
                            appBarActions.CloseTarget({ targetId: target.id })
                          );
                          e.stopPropagation();
                        }}
                      />
                    </IconButton>
                  </Box>
                }
              />
            ))}
          </Tabs>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="refresh"
            onClick={() => dispatch(appBarActions.RefreshData())}
          >
            <Refresh />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box flex="1 1 0" overflow="hidden">
        <RouterOutlet
          router={router}
          token={dashboardRouteToken}
          component={DashboardPage}
        />
        <RouterOutlet
          router={router}
          token={targetRouteToken}
          component={TargetPage}
        />
      </Box>
    </Box>
  );
}
