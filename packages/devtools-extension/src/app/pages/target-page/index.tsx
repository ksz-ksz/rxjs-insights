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

export function TargetPage() {
  const eventsSection = useEventsSection();
  const scopeSection = useScopeSection();
  const targetsSection = useTargetSection();

  const leftPanelSections = useMemo(
    (): SidePanelSection[] => [{ label: 'EVENTS', entries: eventsSection }],
    [eventsSection]
  );

  const rightPanelSections = useMemo(
    (): SidePanelSection[] => [
      { label: 'SCOPE', entries: scopeSection },
      { label: 'RELATED TARGETS', entries: targetsSection },
    ],
    [scopeSection, targetsSection]
  );

  const leftPanelRef = useRef<SidePanelControl | null>(null);
  useScrollToEventReaction(leftPanelRef);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <React.Profiler id={'left-panel'} onRender={onRender}>
        <SidePanel
          side="left"
          sections={leftPanelSections}
          maxWidth="33%"
          ref={leftPanelRef}
        />
      </React.Profiler>
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
      <React.Profiler id={'right-panel'} onRender={onRender}>
        <SidePanel side="right" sections={rightPanelSections} maxWidth="33%" />
      </React.Profiler>
    </Box>
  );
}

function onRender(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number
) {
  console.log({
    id,
    phase,
    actualDuration,
    baseDuration,
  });
}
