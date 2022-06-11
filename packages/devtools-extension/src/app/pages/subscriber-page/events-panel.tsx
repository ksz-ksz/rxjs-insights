import { RelatedEvent, RelatedTask, Relations } from '@app/protocols/insights';
import React, { ReactNode, useCallback, useMemo } from 'react';
import { IconButton, Stack, styled } from '@mui/material';
import { useDispatch, useSelector } from '@app/store';
import { timeSelector } from '@app/selectors/insights-selectors';
import { activeSubscriberStateSelector } from '@app/selectors/active-target-state-selector';
import { eventsLogActions } from '@app/actions/events-log-actions';
import { getEventElementId } from '@app/utils/get-event-element-id';
import { RefOutlet } from '@app/components/ref-outlet';
import { partition } from '@app/utils/partition';
import {
  FastForward,
  FastRewind,
  PlayArrow,
  SkipNext,
  SkipPrevious,
} from '@mui/icons-material';

interface EventEntry {
  type: 'event';
  indent: number;
  event: RelatedEvent;
}

interface EventAsyncEntry {
  type: 'event-async';
  indent: number;
  task: RelatedTask;
  event: RelatedEvent;
}

interface TaskEntry {
  type: 'task';
  task: RelatedTask;
}

type Entry = EventEntry | EventAsyncEntry | TaskEntry;

interface EventNode {
  event: RelatedEvent;
  childEvents: EventNode[];
}

interface TaskNode {
  task: RelatedTask;
  childEvents: EventNode[];
}

function getEventNode(relations: Relations, event: RelatedEvent): EventNode {
  return {
    event,
    childEvents: event.succeedingEvents.map((event) =>
      getEventNode(relations, relations.events[event])
    ),
  };
}

function getTaskNode(relations: Relations, events: RelatedEvent[]): TaskNode {
  const rootEvents = events.filter(
    (event) =>
      event.precedingEvent === undefined ||
      relations.events[event.precedingEvent] === undefined ||
      relations.events[event.precedingEvent].task !== event.task
  );
  return {
    task: relations.tasks[rootEvents[0].task],
    childEvents: rootEvents.map((rootEvent) =>
      getEventNode(relations, rootEvent)
    ),
  };
}

function getTaskNodes(relations: Relations) {
  const events = Object.values(relations.events).sort(
    (a, b) => a.time - b.time
  );
  return partition(events, (a, b) => a.task !== b.task).map((events) =>
    getTaskNode(relations, events)
  );
}

function visitEventNodes(
  relations: Relations,
  entries: Entry[],
  indents: Record<number, number>,
  childEvents: EventNode[],
  parentEvent?: EventNode
) {
  for (const childEvent of childEvents) {
    if (
      parentEvent === undefined ||
      childEvent.event.task === parentEvent.event.task
    ) {
      const indent =
        parentEvent !== undefined ? indents[parentEvent.event.time] + 1 : 0;
      indents[childEvent.event.time] = indent;
      entries.push({
        type: 'event',
        event: childEvent.event,
        indent,
      });
      visitEventNodes(
        relations,
        entries,
        indents,
        childEvent.childEvents,
        childEvent
      );
    } else {
      const indent = indents[parentEvent.event.time] + 1;
      entries.push({
        type: 'event-async',
        event: childEvent.event,
        task: relations.tasks[childEvent.event.task],
        indent,
      });
    }
  }
}

function getEventLog(relations: Relations) {
  const taskNodes = getTaskNodes(relations);

  const entries: Entry[] = [];
  const indents: Record<number, number> = {};
  for (const taskNode of taskNodes) {
    entries.push({
      type: 'task',
      task: taskNode.task,
    });
    visitEventNodes(relations, entries, indents, taskNode.childEvents);
  }

  return entries;
}

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

// const EventsControlsDiv = styled('div')(({theme}) => ({
//   display: 'flex',
//   flexDirection: 'row',
//   justifyContent: 'center'
// }))

export function EventsControls() {
  return (
    <Stack
      sx={{ backgroundColor: 'divider' }}
      direction="row"
      spacing={1}
      justifyContent="center"
    >
      <IconButton>
        <SkipPrevious />
      </IconButton>
      <IconButton>
        <FastRewind />
      </IconButton>
      <IconButton>
        <PlayArrow />
      </IconButton>
      <IconButton>
        <FastForward />
      </IconButton>
      <IconButton>
        <SkipNext />
      </IconButton>
    </Stack>
  );
}

function EventsLog() {
  const dispatch = useDispatch();
  const time = useSelector(timeSelector);
  const state = useSelector(activeSubscriberStateSelector)!;
  const entries = useMemo(
    () => (state ? getEventLog(state.relations) : []),
    [state]
  );
  const onEventSelected = useCallback(
    (event: RelatedEvent) =>
      dispatch(eventsLogActions.EventSelected({ event })),
    []
  );
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
  return (
    <EventsPanelDiv>
      <EventsLog />
      <EventsControls />
    </EventsPanelDiv>
  );
}
