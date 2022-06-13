import {
  RelatedEvent,
  RelatedTarget,
  Relations,
} from '@app/protocols/insights';
import React, { ReactNode, useCallback, useMemo } from 'react';
import { IconButton, Stack, styled } from '@mui/material';
import { useDispatch, useSelector } from '@app/store';
import {
  playingSelector,
  timeSelector,
} from '@app/selectors/insights-selectors';
import { activeSubscriberStateSelector } from '@app/selectors/active-target-state-selector';
import { eventsLogActions } from '@app/actions/events-log-actions';
import { getEventElementId } from '@app/utils/get-event-element-id';
import { RefOutlet } from '@app/components/ref-outlet';
import {
  FastForward,
  FastRewind,
  Pause,
  PlayArrow,
  SkipNext,
  SkipPrevious,
} from '@mui/icons-material';
import {
  EventLogEntry,
  getEventLogEntries,
} from '@app/pages/subscriber-page/get-event-log-entries';
import { isExcluded } from '@app/pages/subscriber-page/is-excluded';
import { createSelector, useDispatchCallback } from '@lib/store';

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
  overflow: 'auto',
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

interface EventsControlsProps {
  playing: boolean;
  onGoToFirst(): void;
  onGoToPrev(): void;
  onPlay(): void;
  onPause(): void;
  onGoToNext(): void;
  onGoToLast(): void;
}

export function EventsControls(props: EventsControlsProps) {
  return (
    <Stack
      sx={{ backgroundColor: 'divider' }}
      direction="row"
      spacing={1}
      justifyContent="center"
    >
      <IconButton onClick={props.onGoToFirst}>
        <SkipPrevious />
      </IconButton>
      <IconButton onClick={props.onGoToPrev}>
        <FastRewind />
      </IconButton>
      {props.playing ? (
        <IconButton onClick={props.onPause}>
          <Pause />
        </IconButton>
      ) : (
        <IconButton onClick={props.onPlay}>
          <PlayArrow />
        </IconButton>
      )}
      <IconButton onClick={props.onGoToNext}>
        <FastForward />
      </IconButton>
      <IconButton onClick={props.onGoToLast}>
        <SkipNext />
      </IconButton>
    </Stack>
  );
}

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
                title={entry.excluded ? 'Excluded' : undefined}
                data-type={entry.event.eventType}
                data-selected={entry.event.time === time}
                onClick={() => onEventSelected(entry.event)}
              >
                <Indent indent={entry.indent} />
                <RefOutletSpan data-dim={entry.excluded}>
                  <RefOutlet summary reference={entry.event} />
                  {entry.excluded ? ' ⨯' : ''}
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
                <RefOutletSpan data-dim={true}>
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

function getEvents(relations: Relations) {
  return Object.values(relations.events).sort((a, b) => a.time - b.time);
}

function getIncludedEvents(
  relations: Relations,
  events: RelatedEvent[],
  target: RelatedTarget
) {
  return events.filter((event) => !isExcluded(relations, event, target));
}

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
  [activeSubscriberStateSelector],
  ([activeSubscriberState]) => {
    const { ref, relations } = activeSubscriberState!;
    const target = relations.targets[ref.id];
    const allEvents = getEvents(relations);
    const events = getIncludedEvents(relations, allEvents, target);
    const entries = getEventLogEntries(relations, allEvents, target);

    return { events, entries };
  }
);

const vmSelector = createSelector(
  [eventsSelector, timeSelector, playingSelector],
  ([events, time, playing]) => ({ ...events, time, playing })
);

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

  return (
    <EventsPanelDiv>
      <EventsLog
        time={vm.time}
        entries={vm.entries}
        onEventSelected={onEventSelected}
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
    </EventsPanelDiv>
  );
}
