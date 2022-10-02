import React, { useMemo, useRef } from 'react';
import { Box } from '@mui/material';
import { SidePanel } from '@app/components';
import { SubscribersGraph } from '@app/pages/target-page/subscribers-graph';
import { useEventsSection } from '@app/pages/target-page/use-events-section';
import { ControlsPanel } from '@app/pages/target-page/controls-panel';
import { SidePanelControl, SidePanelSection } from '@app/components/side-panel';
import { useScopeSection } from '@app/pages/target-page/use-scope-section';
import { useTargetSection } from '@app/pages/target-page/use-target-section';
import { effect, filterActions, useReaction } from '@lib/store';
import { eventsLogActions } from '@app/actions/events-log-actions';
import { insightsActions } from '@app/actions/insights-actions';
import { refOutletContextActions } from '@app/actions/ref-outlet-context-actions';
import { useSelector } from '@app/store';
import { activeTargetStateSelector } from '@app/selectors/active-target-state-selector';
import { useSidePanelWidth } from '@app/utils';

function useScrollToEventReaction(
  leftPanelRef: React.MutableRefObject<SidePanelControl | null>
) {
  useReaction(
    (action$) =>
      action$.pipe(
        filterActions([
          eventsLogActions.EventSelected,
          insightsActions.PlayNextEvent,
          refOutletContextActions.FocusEvent,
        ]),
        effect((action) => {
          const leftPanel = leftPanelRef.current;
          if (leftPanel) {
            const { event } = action.payload;
            leftPanel.scrollToKey(`event-${event.time}`);
          }
        })
      ),
    []
  );
}

export function LeftPanel() {
  const eventsSection = useEventsSection();
  const sections = useMemo(
    (): SidePanelSection[] => [{ label: 'EVENTS', entries: eventsSection }],
    [eventsSection]
  );
  const panelWidth = useSidePanelWidth(
    400,
    'ui:target-page:side-panel:left:width'
  );
  const panelRef = useRef<SidePanelControl | null>(null);
  useScrollToEventReaction(panelRef);

  return (
    <SidePanel
      side="left"
      sections={sections}
      maxWidth="33%"
      ref={panelRef}
      {...panelWidth}
    />
  );
}

export function RightPanel() {
  const scopeSection = useScopeSection();
  const targetsSection = useTargetSection();

  const sections = useMemo(
    (): SidePanelSection[] => [
      { label: 'SCOPE', entries: scopeSection },
      { label: 'RELATED TARGETS', entries: targetsSection },
    ],
    [scopeSection, targetsSection]
  );
  const panelWidth = useSidePanelWidth(
    400,
    'ui:target-page:side-panel:right:width'
  );

  return (
    <SidePanel
      side="right"
      sections={sections}
      maxWidth="33%"
      {...panelWidth}
    />
  );
}

export function TargetPage() {
  const activeTargetState = useSelector(activeTargetStateSelector);

  if (!activeTargetState) {
    return null;
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <LeftPanel />
      <Box
        sx={{
          flexGrow: 1,
          flexShrink: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <SubscribersGraph />
        <ControlsPanel />
      </Box>
      <RightPanel />
    </Box>
  );
}
