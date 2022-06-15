import {
  RelatedEvent,
  RelatedTarget,
  RelatedTask,
  Relations,
} from '@app/protocols/insights';
import { partition } from '@app/utils/partition';
import { isExcluded } from '@app/pages/subscriber-page/is-excluded';

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
  childEvents: EventNode[];
}

interface TaskNode {
  task: RelatedTask;
  childEvents: EventNode[];
}

function getChildEvents(
  rootTarget: RelatedTarget,
  relations: Relations,
  event: RelatedEvent,
  expandedIds: Set<number>
) {
  const childEvents: EventNode[] = [];
  for (const childEventId of event.succeedingEvents) {
    const childEvent = relations.events[childEventId];
    // if (relations.targets[childEvent.target] !== undefined) {
    childEvents.push(
      getEventNode(rootTarget, relations, childEvent, expandedIds)
    );
    // }
  }
  return childEvents;
}

function getEventNode(
  rootTarget: RelatedTarget,
  relations: Relations,
  event: RelatedEvent,
  expandedIds: Set<number>
): EventNode {
  return {
    event,
    excluded: isExcluded(relations, event, rootTarget, expandedIds),
    childEvents: getChildEvents(rootTarget, relations, event, expandedIds),
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
  rootTarget: RelatedTarget,
  relations: Relations,
  events: RelatedEvent[],
  expandedIds: Set<number>
): TaskNode {
  const rootEvents = events.filter((event) => isRootEvent(relations, event));
  const childEvents: EventNode[] = [];
  for (const childEvent of events) {
    if (isRootEvent(relations, childEvent)) {
      childEvents.push(
        getEventNode(rootTarget, relations, childEvent, expandedIds)
      );
    }
  }
  return {
    task: relations.tasks[rootEvents[0].task],
    childEvents,
  };
}

function getTaskNodes(
  rootTarget: RelatedTarget,
  events: RelatedEvent[],
  relations: Relations,
  expandedIds: Set<number>
) {
  return partition(events, (a, b) => a.task !== b.task).map((events) =>
    getTaskNode(rootTarget, relations, events, expandedIds)
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
  rootTarget: RelatedTarget,
  expandedIds: Set<number>
) {
  const taskNodes = getTaskNodes(rootTarget, events, relations, expandedIds);

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
