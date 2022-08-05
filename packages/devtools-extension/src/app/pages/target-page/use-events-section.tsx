import {
  EventAsyncEntry,
  EventEntry,
  getEventLogEntries,
  TaskEntry,
} from '@app/pages/target-page/get-event-log-entries';
import { RelatedEvent } from '@app/protocols/insights';
import { getEventElementId } from '@app/utils/get-event-element-id';
import { Indent } from '@app/components/indent';
import { RefSummaryOutlet } from '@app/components/ref-outlet';
import React, { useMemo } from 'react';
import { styled } from '@mui/material';
import { createSelector, useDispatchCallback } from '@lib/store';
import {
  activeTargetStateSelector,
  activeTargetUiStateSelector,
} from '@app/selectors/active-target-state-selector';
import { getTargetTimeframes } from '@app/pages/target-page/get-target-timeframes';
import { getEvents } from '@app/pages/target-page/get-events';
import { SidePanelEntry } from '@app/components/side-panel';
import { useSelector } from '@app/store';
import { eventsLogActions } from '@app/actions/events-log-actions';
import { timeSelector } from '@app/selectors/insights-selectors';

const TaskDiv = styled('div')(({ theme }) => ({
  display: 'flex',
  fontFamily: 'Monospace',
  fontStyle: 'oblique',
  color: theme.palette.text.secondary,
  marginLeft: '1rem',
  marginRight: '1rem',
  whiteSpace: 'nowrap',
  '&:after': {
    borderTop: `thin solid ${theme.palette.divider}`,
    content: '""',
    flexGrow: 1,
    alignSelf: 'center',
    marginLeft: '1rem',
  },
}));
const EventDiv = styled('div')(({ theme }) => ({
  display: 'block',
  whiteSpace: 'nowrap',
  paddingRight: '1rem',
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
const eventsSelector = createSelector(
  [activeTargetStateSelector, activeTargetUiStateSelector],
  ([activeTargetState, activeTargetUiState]) => {
    const { target, relations } = activeTargetState!;
    const { expandedKeys } = activeTargetUiState!;
    const timeframes = getTargetTimeframes(target, relations, expandedKeys);
    const allEvents = getEvents(relations);
    const entries = getEventLogEntries(relations, allEvents, timeframes);

    return { entries };
  }
);
const vmSelector = createSelector(
  [eventsSelector, timeSelector],
  ([{ entries }, time]) => ({
    entries,
    time,
  })
);

export function useEventsSection() {
  const vm = useSelector(vmSelector);
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
