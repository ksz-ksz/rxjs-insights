import React from 'react';
import { Box } from '@mui/material';
import { SidePanel, SidePanelSection } from '@app/components';
import { EventsPanel } from '@app/pages/target-page/events-panel';
import { SubscribersGraph } from '@app/pages/target-page/subscribers-graph';
import { ContextPanel } from '@app/pages/target-page/context-panel';
import { TargetsPanel } from '@app/pages/target-page/targets-panel';

export function TargetPage() {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <SidePanel side="left" id="events-side-panel">
        <SidePanelSection title="EVENTS">
          <EventsPanel />
        </SidePanelSection>
      </SidePanel>
      <Box sx={{ flexGrow: 1, flexShrink: 1 }}>
        <SubscribersGraph />
      </Box>
      <SidePanel side="right">
        <SidePanelSection title="SCOPE">
          <ContextPanel />
        </SidePanelSection>
        <SidePanelSection title="TARGETS">
          <TargetsPanel />
        </SidePanelSection>
      </SidePanel>
    </Box>
  );
}
