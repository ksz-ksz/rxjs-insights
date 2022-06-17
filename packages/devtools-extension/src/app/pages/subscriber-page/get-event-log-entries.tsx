import { RelatedEvent, RelatedTask, Relations } from '@app/protocols/insights';
import { partition } from '@app/utils/partition';
import { isExcluded } from '@app/pages/subscriber-page/is-excluded';
import { Timeframe } from '@app/pages/subscriber-page/get-target-timeframes';

export interface EventEntry {
  type: 'event';
  indent: number;
  event: RelatedEvent;
  excluded: boolean;
}

export interface EventAsyncEntry {
  type: 'event-async';
  indent: number;
  task: RelatedTask;
  event: RelatedEvent;
}

export interface TaskEntry {
  type: 'task';
  task: RelatedTask;
}

export type EventLogEntry = EventEntry | EventAsyncEntry | TaskEntry;

interface EventNode {
  event: RelatedEvent;
  excluded: boolean;
  childrenExcluded: boolean;
  childEvents: EventNode[];
}

interface TaskNode {
  task: RelatedTask;
  childEvents: EventNode[];
}

function getChildEvents(
  relations: Relations,
  event: RelatedEvent,
  timeframes: Record<number, Timeframe>
) {
  const childEvents: EventNode[] = [];
  for (const childEventId of event.succeedingEvents) {
    const childEvent = relations.events[childEventId];
    childEvents.push(getEventNode(relations, childEvent, timeframes));
  }
  return childEvents;
}

function getEventNode(
  relations: Relations,
  event: RelatedEvent,
  timeframes: Record<number, Timeframe>
): EventNode {
  const excluded = isExcluded(relations, event, timeframes);
  const childEvents = getChildEvents(relations, event, timeframes);
  const childrenExcluded = childEvents
    .map((child) => child.excluded && child.childrenExcluded)
    .reduce((acc, x) => acc && x, true);
  return {
    event,
    excluded,
    childEvents,
    childrenExcluded,
  };
}

function isRootEvent(relations: Relations, event: RelatedEvent) {
  if (event.precedingEvent === undefined) {
    return true;
  }
  const precedingEvent = relations.events[event.precedingEvent];
  return precedingEvent.task !== event.task;
}

function getTaskNode(
  relations: Relations,
  events: RelatedEvent[],
  timeframes: Record<number, Timeframe>
): TaskNode {
  const childEvents: EventNode[] = [];
  for (const childEvent of events) {
    if (isRootEvent(relations, childEvent)) {
      const eventNode = getEventNode(relations, childEvent, timeframes);
      if (!eventNode.childrenExcluded) {
        childEvents.push(eventNode);
      }
    }
  }
  return {
    task: relations.tasks[events[0].task],
    childEvents,
  };
}

function getTaskNodes(
  events: RelatedEvent[],
  relations: Relations,
  timeframes: Record<number, Timeframe>
) {
  return partition(events, (a, b) => a.task !== b.task).map((events) =>
    getTaskNode(relations, events, timeframes)
  );
}

function visitEventNodes(
  relations: Relations,
  entries: EventLogEntry[],
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
        excluded: childEvent.excluded,
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

export function getEventLogEntries(
  relations: Relations,
  events: RelatedEvent[],
  timeframes: Record<number, Timeframe>
) {
  const taskNodes = getTaskNodes(events, relations, timeframes);

  const entries: EventLogEntry[] = [];
  const indents: Record<number, number> = {};
  for (const taskNode of taskNodes) {
    if (taskNode.childEvents.length !== 0) {
      entries.push({
        type: 'task',
        task: taskNode.task,
      });
      visitEventNodes(relations, entries, indents, taskNode.childEvents);
    }
  }

  return entries;
}
