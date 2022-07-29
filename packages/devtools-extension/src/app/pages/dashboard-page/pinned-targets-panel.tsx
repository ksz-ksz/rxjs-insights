import React from 'react';
import { RefSummaryOutlet } from '@app/components/ref-outlet';
import { useDispatch, useSelector } from '@app/store';
import { targetsSelector } from '@app/selectors/targets-selectors';
import { createUrl, RouterLink } from '@lib/store-router';
import { router } from '@app/router';
import { TargetsPanelDiv } from '@app/components/targets-panel-div';
import { Close } from '@mui/icons-material';
import { appBarActions } from '@app/actions/app-bar-actions';
import { Box, IconButton, Typography } from '@mui/material';
import { LocationOutlet } from '@app/components/location-outlet';

export function PinnedTargetsPanel() {
  const vm = useSelector(targetsSelector);
  const dispatch = useDispatch();

  return (
    <TargetsPanelDiv>
      {vm.targets.length === 0 && (
        <Typography align="center" sx={{ color: 'text.secondary', padding: 2 }}>
          Nothing here
        </Typography>
      )}
      {vm.targets.map((target) => (
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
          <Box sx={{ marginLeft: 2 }}>
            <LocationOutlet locations={target.locations} />
            <IconButton
              size="small"
              edge="start"
              aria-label="close"
              sx={{ ml: 1 }}
            >
              <Close
                fontSize="inherit"
                onClick={(e) => {
                  dispatch(appBarActions.CloseTarget({ targetId: target.id }));
                  e.stopPropagation();
                }}
              />
            </IconButton>
          </Box>
        </RouterLink>
      ))}
    </TargetsPanelDiv>
  );
}
