import { useDispatch, useSelector } from '@app/store';
import { targetsSelector } from '@app/selectors/targets-selectors';
import { SidePanelEntry } from '@app/components/side-panel';
import { createUrl, RouterLink } from '@lib/store-router';
import { router } from '@app/router';
import { RefSummaryOutlet } from '@app/components/ref-outlet';
import { Box, IconButton } from '@mui/material';
import { LocationOutlet } from '@app/components/location-outlet';
import { dashboardActions } from '@app/actions/dashboad-actions';
import { Close } from '@mui/icons-material';
import React, { useMemo } from 'react';

export function usePinnedTargetsSection() {
  const vm = useSelector(targetsSelector);
  const dispatch = useDispatch();

  const entries = vm.targets.map(
    (target): SidePanelEntry => ({
      key: `pinned-target-${target.id}`,
      getHeight(): number {
        return 24;
      },
      render() {
        return (
          <RouterLink
            key={target.id}
            router={router}
            to={createUrl(['target', String(target.id)])}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <RefSummaryOutlet reference={target} />
            <Box sx={{ marginLeft: 2, whiteSpace: 'nowrap' }}>
              <LocationOutlet locations={target.locations} />
              <IconButton
                size="small"
                edge="start"
                aria-label="close"
                sx={{ ml: 1 }}
                onClick={(e) => {
                  dispatch(dashboardActions.UnpinTarget({ target }));
                  e.stopPropagation();
                }}
              >
                <Close fontSize="inherit" />
              </IconButton>
            </Box>
          </RouterLink>
        );
      },
    })
  );

  return useMemo(() => entries, [vm, dispatch]);
}
