import { RelatedEvent } from '@app/protocols/insights';
import React, { ReactNode, useMemo } from 'react';
import { styled } from '@mui/material';
import { useSelector } from '@app/store';
import {
  playingSelector,
  timeSelector,
} from '@app/selectors/insights-selectors';
import {
  activeTargetStateSelector,
  activeTargetUiStateSelector,
} from '@app/selectors/active-target-state-selector';
import { eventsLogActions } from '@app/actions/events-log-actions';
import { getEventElementId } from '@app/utils/get-event-element-id';
import { RefOutlet } from '@app/components/ref-outlet';
import {
  EventLogEntry,
  getEventLogEntries,
} from '@app/pages/target-page/get-event-log-entries';
import { createSelector, useDispatchCallback } from '@lib/store';
import { getTargetTimeframes } from '@app/pages/target-page/get-target-timeframes';
import { getEvents } from '@app/pages/target-page/get-events';
import { getIncludedEvents } from '@app/pages/target-page/get-included-events';
import { EventsTimeline } from '@app/pages/target-page/events-timeline';
import { EventsControls } from '@app/pages/target-page/events-controls';

const IndentSpan = styled('span')(({ theme }) => ({
  display: 'inline-block',
  width: '1rem',
  height: '1.5rem',
  borderRight: `thin solid ${theme.palette.divider}`,
  margin: '-0.25rem 0',
}));

const TaskSpan = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  fontFamily: 'Monospace',
  fontStyle: 'oblique',
  color: theme.palette.text.secondary,
  marginLeft: '1rem',
  marginRight: '1rem',
  '&:after': {
    borderTop: `thin solid ${theme.palette.divider}`,
    content: '""',
    flexGrow: 1,
    alignSelf: 'center',
    marginLeft: '1rem',
  },
}));

interface IndentProps {
  indent: number;
}

const EventsLogDiv = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  whiteSpace: 'nowrap',
  height: '100%',
  cursor: 'default',
});

function Indent({ indent }: IndentProps) {
  const children = useMemo(() => {
    const children: ReactNode[] = [];
    for (let i = 0; i < indent; i++) {
      children.push(<IndentSpan />);
    }
    return children;
  }, [indent]);
  return <>{children}</>;
}

const EventSpan = styled('span')(({ theme }) => ({
  paddingRight: '1rem',
  '&[data-selected=true]': {
    backgroundColor: theme.palette.action.selected,
  },
}));

interface EventLogProps {
  time: number;
  entries: EventLogEntry[];
  onEventSelected(event: RelatedEvent): void;
}

const RefOutletSpan = styled('span')({
  fontFamily: 'Monospace',
  cursor: 'default',
  '&[data-dim=true]': {
    opacity: 0.5,
  },
});

function EventsLog({ time, entries, onEventSelected }: EventLogProps) {
  return (
    <EventsLogDiv>
      {entries.map((entry) => {
        switch (entry.type) {
          case 'task':
            return (
              <TaskSpan>
                {entry.task.name} #{entry.task.id}
              </TaskSpan>
            );
          case 'event':
            return (
              <EventSpan
                id={getEventElementId(entry.event.time)}
                data-type={entry.event.eventType}
                data-selected={entry.event.time === time}
                onClick={() => onEventSelected(entry.event)}
              >
                <Indent indent={entry.indent} />
                <RefOutletSpan data-dim={entry.excluded}>
                  <RefOutlet summary reference={entry.event} />
                </RefOutletSpan>
              </EventSpan>
            );
          case 'event-async':
            return (
              <EventSpan
                title={`${entry.task.name} #${entry.task.id}`}
                data-type={entry.event.eventType}
                data-selected={entry.event.time === time}
                onClick={() => onEventSelected(entry.event)}
              >
                <Indent indent={entry.indent} />
                <RefOutletSpan data-dim={entry.excluded}>
                  <RefOutlet summary reference={entry.event} />
                  {' ↴'}
                </RefOutletSpan>
              </EventSpan>
            );
        }
      })}
    </EventsLogDiv>
  );
}

const EventsPanelDiv = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

function findLastIndex<T>(items: T[], predicate: (item: T) => boolean): number {
  for (let i = items.length - 1; i >= 0; i--) {
    if (predicate(items[i])) {
      return i;
    }
  }
  return -1;
}

function findFirstIndex<T>(
  items: T[],
  predicate: (item: T) => boolean
): number {
  for (let i = 0; i < items.length; i++) {
    if (predicate(items[i])) {
      return i;
    }
  }
  return -1;
}

const eventsSelector = createSelector(
  [activeTargetStateSelector, activeTargetUiStateSelector],
  ([activeTargetState, activeTargetUiState]) => {
    const { target, relations } = activeTargetState!;
    const { expandedKeys } = activeTargetUiState!;
    const timeframes = getTargetTimeframes(target, relations, expandedKeys);
    const allEvents = getEvents(relations);
    const events = getIncludedEvents(relations, allEvents, timeframes);
    const entries = getEventLogEntries(relations, allEvents, timeframes);

    return { events, entries, relations };
  }
);

const vmSelector = createSelector(
  [eventsSelector, timeSelector, playingSelector],
  ([{ events, entries, relations }, time, playing]) => ({
    events,
    entries,
    time,
    playing,
    event: relations.events[time],
  })
);

function binarySearch<T, U>(
  array: T[],
  item: U,
  compare: (a: U, b: T) => number
) {
  let m = 0;
  let n = array.length - 1;
  while (m <= n) {
    const k = (n + m) >> 1;
    const c = compare(item, array[k]);
    if (c > 0) {
      m = k + 1;
    } else if (c < 0) {
      n = k - 1;
    } else {
      return k;
    }
  }
  return -m - 1;
}

function getClosestEvent(
  events: RelatedEvent[],
  index: number,
  timestamp: number
) {
  const a = events[index - 1];
  const b = events[index];
  if (
    a &&
    Math.abs(a.timestamp - timestamp) < Math.abs(b.timestamp - timestamp)
  ) {
    return a;
  } else {
    return b;
  }
}

const ControlsDiv = styled('div')(({ theme }) => ({
  position: 'sticky',
  bottom: 0,
  zIndex: 1,
  backgroundColor: theme.custom.sidePanelHeaderBackground,
}));

export function EventsPanel() {
  const vm = useSelector(vmSelector);

  const onEventSelected = useDispatchCallback(
    (event: RelatedEvent) => eventsLogActions.EventSelected({ event }),
    []
  );

  const onGoToFirst = useDispatchCallback(() => {
    const first = vm.events.at(0)!;
    return eventsLogActions.EventSelected({ event: first });
  }, [vm.events]);

  const onGoToPrev = useDispatchCallback(() => {
    const prevEventIndex = findLastIndex(
      vm.events,
      (event) => event.time < vm.time
    );
    const prevEvent = vm.events[prevEventIndex];
    return prevEvent
      ? eventsLogActions.EventSelected({ event: prevEvent })
      : undefined;
  }, [vm.events, vm.time]);

  const onPlay = useDispatchCallback(() => {
    const nextEventIndex = findFirstIndex(
      vm.events,
      (event) => event.time > vm.time
    );
    const restEvents = vm.events.slice(nextEventIndex);
    return eventsLogActions.Play({ events: restEvents });
  }, [vm.events, vm.time]);

  const onPause = useDispatchCallback(() => eventsLogActions.Pause(), []);

  const onGoToNext = useDispatchCallback(() => {
    const nextEventIndex = findFirstIndex(
      vm.events,
      (event) => event.time > vm.time
    );
    const nextEvent = vm.events[nextEventIndex];
    return nextEvent
      ? eventsLogActions.EventSelected({ event: nextEvent })
      : undefined;
  }, [vm.events, vm.time]);

  const onGoToLast = useDispatchCallback(() => {
    const last = vm.events.at(-1)!;
    return eventsLogActions.EventSelected({ event: last });
  }, [vm.events]);

  const onTimestampSelected = useDispatchCallback(
    (timestamp) => {
      const index = binarySearch(
        vm.events,
        timestamp,
        (t, e) => t - e.timestamp
      );
      const event =
        index >= 0
          ? vm.events[index]
          : getClosestEvent(vm.events, -index - 1, timestamp);
      return eventsLogActions.EventSelected({ event });
    },
    [vm.events]
  );

  return (
    <EventsPanelDiv>
      <EventsLog
        time={vm.time}
        entries={vm.entries}
        onEventSelected={onEventSelected}
      />
      <ControlsDiv>
        <EventsTimeline
          events={vm.events}
          event={vm.event}
          onTimestampSelected={onTimestampSelected}
        />
        <EventsControls
          playing={vm.playing}
          onGoToFirst={onGoToFirst}
          onGoToPrev={onGoToPrev}
          onPlay={onPlay}
          onPause={onPause}
          onGoToNext={onGoToNext}
          onGoToLast={onGoToLast}
        />
      </ControlsDiv>
    </EventsPanelDiv>
  );
}
