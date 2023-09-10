import {
  AppBar,
  Box,
  Button,
  IconButton,
  styled,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import React from 'react';
import { createUrl, RouterLink, RouterOutlet } from '@lib/store-router';
import {
  dashboardRouteToken,
  old_router,
  targetRouteToken,
} from '@app/old_router';
import { Bookmark, BookmarkAdded, Refresh } from '@mui/icons-material';
import { useDispatch, useSelector } from '@app/store';
import { appBarActions } from '@app/actions/app-bar-actions';
import { TargetPage } from '@app/pages/target-page';
import { DashboardPage } from '@app/pages/dashboard-page';
import { RefSummaryOutlet } from '@app/components/ref-outlet';
import { activeTargetStateSelector } from '@app/selectors/active-target-state-selector';
import { LocationOutlet } from '@app/components/location-outlet';
import { targetsSelector } from '@app/selectors/targets-selectors';
import { createSelector } from '@lib/store';

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

const vm = createSelector(
  [activeTargetStateSelector, targetsSelector],
  ([activeTargetState, targets]) => {
    const target = activeTargetState?.target;
    const isTargetPinned =
      target && targets.targets.find((x) => x.id === target.id) !== undefined;

    return {
      target,
      isTargetPinned,
    };
  }
);

export function AppBarWrapper() {
  const dispatch = useDispatch();
  const { target, isTargetPinned } = useSelector(vm);

  return (
    <Box display="flex" height="100%" flexDirection="column">
      <AppBar
        color="transparent"
        position="static"
        sx={{ flex: '0 0 0', zIndex: '2' }}
      >
        <Toolbar>
          <Box
            sx={{ width: '200px', display: 'flex', justifyContent: 'start' }}
          >
            <Button
              component={RouterLink}
              router={old_router}
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
            {target && (
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                onClick={() =>
                  dispatch(
                    isTargetPinned
                      ? appBarActions.UnpinTarget({ target })
                      : appBarActions.PinTarget({ target })
                  )
                }
              >
                {isTargetPinned ? (
                  <BookmarkAdded titleAccess="Target is pinned. Click to unpin." />
                ) : (
                  <Bookmark titleAccess="Target is not pinned. Click to pin." />
                )}
              </IconButton>
            )}
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              onClick={() => dispatch(appBarActions.RefreshData())}
            >
              <Refresh titleAccess="Refresh data" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box flex="1 1 0" overflow="hidden">
        <RouterOutlet
          router={old_router}
          token={dashboardRouteToken}
          component={DashboardPage}
        />
        <RouterOutlet
          router={old_router}
          token={targetRouteToken}
          component={TargetPage}
        />
      </Box>
    </Box>
  );
}
