import {
  AppBar,
  Box,
  Button,
  Divider,
  IconButton,
  styled,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import React from 'react';
import { createUrl, RouterLink, RouterOutlet } from '@lib/store-router';
import { dashboardRouteToken, router, targetRouteToken } from '@app/router';
import { Refresh } from '@mui/icons-material';
import { useDispatch, useSelector } from '@app/store';
import { appBarActions } from '@app/actions/app-bar-actions';
import { TargetPage } from '@app/pages/target-page';
import { DashboardPage } from '@app/pages/dashboard-page';
import { RefSummaryOutlet } from '@app/components/ref-outlet';
import { activeTargetStateSelector } from '@app/selectors/active-target-state-selector';
import { LocationOutlet } from '@app/components/location-outlet';

const HomeSpan = styled('span')(({ theme }) => ({
  fontWeight: 600,
  background: `linear-gradient(to bottom right, ${theme.insights.observable.secondary} 0%, ${theme.insights.subscriber.secondary} 100%)`,
  '-webkit-background-clip': 'text',
  '-webkit-text-fill-color': 'transparent',
}));

function Spacer({ space }: { space: number }) {
  const theme = useTheme();
  return (
    <span style={{ width: theme.spacing(space), display: 'inline-block' }} />
  );
}

export function AppBarWrapper() {
  const dispatch = useDispatch();
  const target = useSelector(activeTargetStateSelector)?.target;

  return (
    <Box display="flex" height="100%" flexDirection="column">
      <AppBar color="transparent" position="static" sx={{ flex: '0 0 0' }}>
        <Toolbar>
          <Box
            sx={{ width: '200px', display: 'flex', justifyContent: 'start' }}
          >
            <Button
              component={RouterLink}
              router={router}
              to={createUrl(['dashboard'])}
            >
              <HomeSpan>RxJS Insights</HomeSpan>
            </Button>
          </Box>
          <Typography
            variant="h6"
            align="center"
            component="div"
            sx={{ flexGrow: 1 }}
          >
            {target && (
              <>
                <RefSummaryOutlet reference={target} />
                <Spacer space={4} />
                <LocationOutlet locations={target.locations} />
              </>
            )}
          </Typography>
          <Box sx={{ width: '200px', display: 'flex', justifyContent: 'end' }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="refresh"
              onClick={() => dispatch(appBarActions.RefreshData())}
            >
              <Refresh />
            </IconButton>
          </Box>
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
