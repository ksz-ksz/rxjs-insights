import { selectTargetsState } from '@app/selectors/targets-selectors';
import { SidePanelEntry } from '@app/components/side-panel';
import { RefSummaryOutlet } from '@app/components/ref-outlet';
import { Box, IconButton } from '@mui/material';
import { LocationOutlet } from '@app/components/location-outlet';
import { dashboardActions } from '@app/actions/dashboad-actions';
import { Close } from '@mui/icons-material';
import React, { useMemo } from 'react';
import { EmptyStateRenderer } from '@app/pages/dashboard-page/empty-state-renderer';
import { TargetRef } from '@app/protocols/refs';
import { useDispatch, useSuperSelector } from '@lib/state-fx/store-react';
import { RouterLink } from '../../../lib/state-fx/store-router-react/router-link';
import { targetRoute } from '@app/routes';
import { routerActions } from '@app/router';

function TargetRenderer({ target }: { target: TargetRef }) {
  const dispatch = useDispatch();

  return (
    <RouterLink
      key={target.id}
      routerActions={routerActions}
      location={targetRoute({ params: { targetId: target.id } })}
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
}

export function usePinnedTargetsSection() {
  const vm = useSuperSelector(selectTargetsState);

  return useMemo(
    (): SidePanelEntry[] =>
      vm.targets.length !== 0
        ? vm.targets.map(
            (target): SidePanelEntry => ({
              key: `pinned-target-${target.id}`,
              getHeight(): number {
                return 24;
              },
              render() {
                return <TargetRenderer target={target} />;
              },
            })
          )
        : [
            {
              key: `pinned-target-empty-state`,
              getHeight(): number {
                return 48;
              },
              render() {
                return (
                  <EmptyStateRenderer text="No targets pinned for inspection" />
                );
              },
            },
          ],
    [vm]
  );
}
