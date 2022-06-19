import { RelatedEvent, RelatedTask, Relations } from '@app/protocols/insights';
import { partition } from '@app/utils/partition';
import { isExcluded } from '@app/pages/target-page/is-excluded';
import { Timeframe } from '@app/pages/target-page/get-target-timeframes';

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
  excluded: boolean;
}

export interface TaskEntry {
  type: 'task';
  task: RelatedTask;
}

export type EventLogEntry = EventEntry | EventAsyncEntry | TaskEntry;

interface EventNode {
  event: RelatedEvent;
  nodeExcluded: boolean;
  treeExcluded: boolean;
  childEventNodes: EventNode[];
}

interface TaskNode {
  task: RelatedTask;
  rootEventNodes: EventNode[];
}

function getChildEventNodes(
  relations: Relations,
  event: RelatedEvent,
  timeframes: Record<number, Timeframe>,
  eventNodes: Record<number, EventNode>
) {
  const childEvents: EventNode[] = [];
  for (const childEventId of event.succeedingEvents) {
    const childEvent = relations.events[childEventId];
    childEvents.push(
      getEventNode(relations, childEvent, timeframes, eventNodes)
    );
  }
  return childEvents;
}

function getChildEventNodesExcluded(childEvents: EventNode[]) {
  for (let childEvent of childEvents) {
    if (!childEvent.treeExcluded) {
      return false;
    }
  }
  return true;
}

function getEventNode(
  relations: Relations,
  event: RelatedEvent,
  timeframes: Record<number, Timeframe>,
  eventNodes: Record<number, EventNode>
): EventNode {
  let eventNode = eventNodes[event.time];
  if (eventNode === undefined) {
    const excluded = isExcluded(relations, event, timeframes);
    const childEventNodes = getChildEventNodes(
      relations,
      event,
      timeframes,
      eventNodes
    );
    eventNode = {
      event,
      childEventNodes,
      nodeExcluded: excluded,
      treeExcluded: excluded && getChildEventNodesExcluded(childEventNodes),
    };
    eventNodes[event.time] = eventNode;
  }

  return eventNode;
}

function isRootEvent(relations: Relations, event: RelatedEvent) {
  if (event.precedingEvent === undefined) {
    return true;
  }
  const precedingEvent = relations.events[event.precedingEvent];
  return precedingEvent.task !== event.task;
}

function getRootEventNodes(
  events: RelatedEvent[],
  relations: Relations,
  timeframes: Record<number, Timeframe>
) {
  const eventNodes: Record<number, EventNode> = {};
  const rootEventNodes: EventNode[] = [];
  for (let event of events) {
    if (isRootEvent(relations, event)) {
      const eventNode = getEventNode(relations, event, timeframes, eventNodes);
      if (!eventNode.treeExcluded) {
        rootEventNodes.push(eventNode);
      }
    }
  }
  return rootEventNodes;
}

function getTaskNodes(
  events: RelatedEvent[],
  relations: Relations,
  timeframes: Record<number, Timeframe>
) {
  const rootEventNodes = getRootEventNodes(events, relations, timeframes);

  return partition(rootEventNodes, (a, b) => a.event.task !== b.event.task).map(
    (taskRootEventNodes): TaskNode => ({
      task: relations.tasks[taskRootEventNodes[0].event.task],
      rootEventNodes: taskRootEventNodes,
    })
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
        excluded: childEvent.nodeExcluded,
        indent,
      });
      visitEventNodes(
        relations,
        entries,
        indents,
        childEvent.childEventNodes,
        childEvent
      );
    } else {
      const indent = indents[parentEvent.event.time] + 1;
      entries.push({
        type: 'event-async',
        event: childEvent.event,
        task: relations.tasks[childEvent.event.task],
        indent,
        excluded: childEvent.nodeExcluded,
      });
    }
  }
}

export function getEventLogEntries(
  relations: Relations,
  events: RelatedEvent[],
  timeframes: Record<number, Timeframe>
) {
  if (events.length === 0) {
    return [];
  }
  const taskNodes = getTaskNodes(events, relations, timeframes);
  const entries: EventLogEntry[] = [];
  const indents: Record<number, number> = {};
  for (const taskNode of taskNodes) {
    if (taskNode.rootEventNodes.length !== 0) {
      entries.push({
        type: 'task',
        task: taskNode.task,
      });
      visitEventNodes(relations, entries, indents, taskNode.rootEventNodes);
    }
  }

  return entries;
}
