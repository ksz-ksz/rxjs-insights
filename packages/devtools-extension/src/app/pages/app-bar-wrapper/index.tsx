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
import { Bookmark, BookmarkAdded, Refresh } from '@mui/icons-material';
import { appBarActions } from '@app/actions/app-bar-actions';
import { RefSummaryOutlet } from '@app/components/ref-outlet';
import { selectActiveTargetState } from '@app/selectors/active-target-state-selector';
import { LocationOutlet } from '@app/components/location-outlet';
import { selectTargetsState } from '@app/selectors/targets-selectors';
import { useDispatch, useSuperSelector } from '@lib/state-fx/store-react';
import { router, routerActions, routerStore } from '@app/router';
import { RouterLink } from '../../../lib/state-fx/store-router-react/router-link';
import { dashboardRoute } from '@app/routes';
import { RouterOutlet } from '../../../lib/state-fx/store-router-react';
import { createSuperSelector } from '../../../lib/state-fx/store/super-selector';

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

const selectVm = createSuperSelector(
  [selectActiveTargetState, selectTargetsState],
  (context) => {
    const target = selectActiveTargetState(context)?.target;
    const isTargetPinned =
      target &&
      selectTargetsState(context).targets.find((x) => x.id === target.id) !==
        undefined;

    return {
      target,
      isTargetPinned,
    };
  }
);

export function AppBarWrapper() {
  const dispatch = useDispatch();
  const { target, isTargetPinned } = useSuperSelector(selectVm);

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
              routerActions={routerActions}
              location={dashboardRoute()}
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
        <RouterOutlet router={router} routerStore={routerStore} />
      </Box>
    </Box>
  );
}
