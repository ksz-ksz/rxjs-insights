import { RelatedEvent, RelatedTask, Relations } from '@app/protocols/insights';
import { partition } from '@app/utils/partition';

export interface EventEntry {
  type: 'event';
  indent: number;
  event: RelatedEvent;
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
  childEvents: EventNode[];
}

interface TaskNode {
  task: RelatedTask;
  childEvents: EventNode[];
}

function getChildEvents(relations: Relations, event: RelatedEvent) {
  const childEvents: EventNode[] = [];
  for (const childEventId of event.succeedingEvents) {
    const childEvent = relations.events[childEventId];
    if (relations.targets[childEvent.target] !== undefined) {
      childEvents.push(getEventNode(relations, childEvent));
    }
  }
  return childEvents;
}

function getEventNode(relations: Relations, event: RelatedEvent): EventNode {
  return {
    event,
    childEvents: getChildEvents(relations, event),
  };
}

function isRootEvent(relations: Relations, event: RelatedEvent) {
  if (event.precedingEvent === undefined) {
    return true;
  }
  const precedingEvent = relations.events[event.precedingEvent];
  if (relations.targets[precedingEvent.target] === undefined) {
    return true;
  }
  return precedingEvent.task !== event.task;
}

function getTaskNode(relations: Relations, events: RelatedEvent[]): TaskNode {
  const rootEvents = events.filter((event) => isRootEvent(relations, event));
  const childEvents: EventNode[] = [];
  for (const childEvent of events) {
    if (isRootEvent(relations, childEvent)) {
      if (relations.targets[childEvent.target] !== undefined) {
        childEvents.push(getEventNode(relations, childEvent));
      }
    }
  }
  return {
    task: relations.tasks[rootEvents[0].task],
    childEvents,
  };
}

function getTaskNodes(events: RelatedEvent[], relations: Relations) {
  return partition(events, (a, b) => a.task !== b.task).map((events) =>
    getTaskNode(relations, events)
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
  events: RelatedEvent[],
  relations: Relations
) {
  const taskNodes = getTaskNodes(events, relations);

  const entries: EventLogEntry[] = [];
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
