import {
  EventAsyncEntry,
  EventEntry,
  ExcludedEntry,
  getEventLogEntries,
  TaskEntry,
} from '@app/pages/target-page/get-event-log-entries';
import { RelatedEvent } from '@app/protocols/insights';
import { getEventElementId } from '@app/utils/get-event-element-id';
import { Indent } from '@app/components/indent';
import { RefSummaryOutlet } from '@app/components/ref-outlet';
import React, { useMemo } from 'react';
import { styled, Typography } from '@mui/material';
import {
  selectActiveTargetState,
  selectTargetUiState,
} from '@app/selectors/active-target-state-selector';
import { getTargetTimeframes } from '@app/pages/target-page/get-target-timeframes';
import { getEvents } from '@app/pages/target-page/get-events';
import { SidePanelEntry } from '@app/components/side-panel';
import { eventsLogActions } from '@app/actions/events-log-actions';
import { selectShowExcludedEvents } from '@app/selectors/insights-selectors';
import { selectTime } from '@app/selectors/time-selectors';
import {
  useDispatchCallback,
  useSuperSelector,
} from '@lib/state-fx/store-react';
import { createSuperSelector } from '../../../lib/state-fx/store/super-selector';

const ExcludedDiv = styled('div')(({ theme }) => ({
  display: 'flex',
  whiteSpace: 'nowrap',
  fontFamily: 'Monospace',
  fontStyle: 'oblique',
  height: '24px',
  alignItems: 'center',
  flexWrap: 'nowrap',
  color: theme.palette.text.disabled,
}));
const TaskDiv = styled('div')(({ theme }) => ({
  display: 'flex',
  height: '24px',
  fontFamily: 'Monospace',
  fontStyle: 'oblique',
  color: theme.palette.text.secondary,
  marginLeft: '0.6rem',
  marginRight: '0.6rem',
  whiteSpace: 'nowrap',
  '&:after': {
    borderTop: `thin solid ${theme.palette.divider}`,
    content: '""',
    flexGrow: 1,
    alignSelf: 'center',
    marginLeft: '0.6rem',
  },
}));
const EventDiv = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'nowrap',
  alignItems: 'center',
  height: '24px',
  whiteSpace: 'nowrap',
  paddingRight: '0.6rem',
  '&[data-selected=true]': {
    backgroundColor: theme.palette.action.selected,
  },
}));
const RefOutletSpan = styled('span')({
  fontFamily: 'Monospace',
  cursor: 'default',
  '&[data-dim=true]': {
    opacity: 0.5,
  },
});
const eventsSelector = createSuperSelector(
  [selectActiveTargetState, selectTargetUiState, selectShowExcludedEvents],
  (context) => {
    const { target, relations } = selectActiveTargetState(context)!;
    const { expandedKeys } = selectTargetUiState(context)!;
    const showExcludedEvents = selectShowExcludedEvents(context);
    const timeframes = getTargetTimeframes(target, relations, expandedKeys);
    const allEvents = getEvents(relations);
    const entries = getEventLogEntries(
      relations,
      allEvents,
      timeframes,
      showExcludedEvents
    );

    return { entries };
  }
);
const selectVm = createSuperSelector(
  [eventsSelector, selectTime],
  (context) => {
    const { entries } = eventsSelector(context);
    const time = selectTime(context);
    return {
      entries,
      time,
    };
  }
);

export function useEventsSection() {
  const vm = useSuperSelector(selectVm);
  const onEventSelected = useDispatchCallback(
    (event: RelatedEvent) => eventsLogActions.EventSelected({ event }),
    []
  );

  return useMemo(
    () =>
      vm.entries.map(
        (entry): SidePanelEntry => ({
          key: entry.id,
          getHeight(): number {
            return 24;
          },
          render() {
            switch (entry.type) {
              case 'task':
                return <TaskEntryRenderer entry={entry} />;
              case 'event':
                return (
                  <EventEntryRenderer
                    entry={entry}
                    time={vm.time}
                    onEventSelected={onEventSelected}
                  />
                );
              case 'event-async':
                return (
                  <EventAsyncEntryRenderer
                    entry={entry}
                    time={vm.time}
                    onEventSelected={onEventSelected}
                  />
                );
              case 'excluded':
                return <ExcludedEntryRenderer entry={entry} />;
            }
          },
        })
      ),
    [vm, onEventSelected]
  );
}

export function TaskEntryRenderer({ entry }: { entry: TaskEntry }) {
  return (
    <TaskDiv key={`task-${entry.task.id}`}>
      {entry.task.name} #{entry.task.id}
    </TaskDiv>
  );
}

export function ExcludedEntryRenderer({ entry }: { entry: ExcludedEntry }) {
  return (
    <ExcludedDiv key={`excluded-${entry.id}`}>
      <Indent indent={entry.indent} />
      <Typography sx={{ px: '0.6rem' }} variant="body2">
        {entry.events.length} entries excluded
      </Typography>
    </ExcludedDiv>
  );
}

export function EventEntryRenderer({
  entry,
  time,
  onEventSelected,
}: {
  entry: EventEntry;
  time: number;
  onEventSelected: (event: RelatedEvent) => void;
}) {
  return (
    <EventDiv
      key={`event-${entry.event.time}`}
      id={getEventElementId(entry.event.time)}
      data-type={entry.event.eventType}
      data-selected={entry.event.time === time}
      onClick={() => onEventSelected(entry.event)}
    >
      <Indent indent={entry.indent} />
      <RefOutletSpan data-dim={entry.excluded}>
        <RefSummaryOutlet reference={entry.event} />
      </RefOutletSpan>
    </EventDiv>
  );
}

export function EventAsyncEntryRenderer({
  entry,
  time,
  onEventSelected,
}: {
  entry: EventAsyncEntry;
  time: number;
  onEventSelected: (event: RelatedEvent) => void;
}) {
  return (
    <EventDiv
      key={`event-async-${entry.event.time}`}
      title={`${entry.task.name} #${entry.task.id}`}
      data-type={entry.event.eventType}
      data-selected={entry.event.time === time}
      onClick={() => onEventSelected(entry.event)}
    >
      <Indent indent={entry.indent} />
      <RefOutletSpan data-dim={entry.excluded}>
        <RefSummaryOutlet reference={entry.event} />
        {' ↴'}
      </RefOutletSpan>
    </EventDiv>
  );
}
