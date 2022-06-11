import { RelatedEvent } from '@app/protocols/insights';
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
                <RefOutlet summary reference={entry.event} />
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
                <span style={{ opacity: 0.5 }}>
                  <RefOutlet summary reference={entry.event} />
                </span>
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

export function EventsPanel() {
  const dispatch = useDispatch();
  const time = useSelector(timeSelector);
  const playing = useSelector(playingSelector);
  const state = useSelector(activeSubscriberStateSelector)!;
  const events = useMemo(
    () => Object.values(state.relations.events).sort((a, b) => a.time - b.time),
    [state]
  );
  const entries = useMemo(
    () => getEventLogEntries(events, state.relations),
    [state, events]
  );
  const onEventSelected = useCallback(
    (event: RelatedEvent) =>
      dispatch(eventsLogActions.EventSelected({ event })),
    []
  );
  const onGoToFirst = useCallback(() => {
    const first = events.at(0)!;
    dispatch(eventsLogActions.EventSelected({ event: first }));
  }, []);
  const onGoToPrev = useCallback(() => {
    const currentEventIndex = events.findIndex((event) => event.time === time);
    const prevEvent = events[currentEventIndex - 1];
    if (prevEvent) {
      dispatch(eventsLogActions.EventSelected({ event: prevEvent }));
    }
  }, [events, time]);
  const onPlay = useCallback(() => {
    const currentEventIndex = events.findIndex((event) => event.time === time);
    const restEvents = events.slice(currentEventIndex + 1);
    dispatch(eventsLogActions.Play({ events: restEvents }));
  }, [events, time]);
  const onPause = useCallback(() => {
    dispatch(eventsLogActions.Pause());
  }, []);
  const onGoToNext = useCallback(() => {
    const currentEventIndex = events.findIndex((event) => event.time === time);
    const nextEvent = events[currentEventIndex + 1];
    if (nextEvent) {
      dispatch(eventsLogActions.EventSelected({ event: nextEvent }));
    }
  }, [events, time]);
  const onGoToLast = useCallback(() => {
    const last = events.at(-1)!;
    dispatch(eventsLogActions.EventSelected({ event: last }));
  }, [events]);
  return (
    <EventsPanelDiv>
      <EventsLog
        time={time}
        entries={entries}
        onEventSelected={onEventSelected}
      />
      <EventsControls
        playing={playing}
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
