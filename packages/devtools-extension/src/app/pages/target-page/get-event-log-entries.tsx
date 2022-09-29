import { RelatedEvent, RelatedTask, Relations } from '@app/protocols/insights';
import { partition } from '@app/utils/partition';
import { isExcluded } from '@app/pages/target-page/is-excluded';
import { Timeframe } from '@app/pages/target-page/get-target-timeframes';

export interface EventItem {
  id: string;
  event: RelatedEvent;
  parentEvent?: EventItem;
  task: RelatedTask;
  excluded: boolean;
  async: boolean;
}

export interface TaskItem {
  id: string;
  task: RelatedTask;
  events: EventItem[];
}

export interface EventEntry {
  id: string;
  type: 'event';
  event: RelatedEvent;
  excluded: boolean;
  indent: number;
}

export interface EventAsyncEntry {
  id: string;
  type: 'event-async';
  task: RelatedTask;
  event: RelatedEvent;
  excluded: boolean;
  indent: number;
}

export interface TaskEntry {
  id: string;
  type: 'task';
  task: RelatedTask;
}

export interface ExcludedEntry {
  id: string;
  type: 'excluded';
  events: RelatedEvent[];
  indent: number;
}

export type EventLogEntry =
  | EventEntry
  | EventAsyncEntry
  | TaskEntry
  | ExcludedEntry;

interface EventNode {
  event: RelatedEvent;
  nodeExcluded: boolean;
  treeExcluded: boolean;
  childEventNodes: EventNode[];
  parentEventNode: EventNode | undefined;
}

interface TaskNode {
  task: RelatedTask;
  rootEventNodes: EventNode[];
}

function getChildEventNodes(
  relations: Relations,
  event: RelatedEvent,
  timeframes: Record<number, Timeframe>,
  eventNodes: Record<number, EventNode>,
  parentEventNode: EventNode | undefined
) {
  const childEvents: EventNode[] = [];
  for (const childEventId of event.succeedingEvents) {
    const childEvent = relations.events[childEventId];
    childEvents.push(
      getEventNode(
        relations,
        childEvent,
        timeframes,
        eventNodes,
        parentEventNode
      )
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
  eventNodes: Record<number, EventNode>,
  parentEventNode: EventNode | undefined
): EventNode {
  let eventNode = eventNodes[event.time];
  if (eventNode === undefined) {
    eventNode = {
      event,
      parentEventNode,
    } as EventNode;
    const excluded = isExcluded(relations, event, timeframes);
    const childEventNodes = getChildEventNodes(
      relations,
      event,
      timeframes,
      eventNodes,
      eventNode
    );
    eventNode.childEventNodes = childEventNodes;
    eventNode.nodeExcluded = excluded;
    eventNode.treeExcluded =
      excluded && getChildEventNodesExcluded(childEventNodes);

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
      const eventNode = getEventNode(
        relations,
        event,
        timeframes,
        eventNodes,
        undefined
      );
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
  entries: EventItem[],
  childEvents: EventNode[],
  parentEvent: EventItem | undefined
) {
  for (const childEvent of childEvents) {
    if (
      parentEvent === undefined ||
      childEvent.event.task === parentEvent.event.task
    ) {
      const eventItem: EventItem = {
        id: `event-${childEvent.event.time}`,
        event: childEvent.event,
        task: relations.tasks[childEvent.event.task],
        excluded: childEvent.nodeExcluded,
        async: false,
        parentEvent: parentEvent,
      };
      entries.push(eventItem);
      visitEventNodes(
        relations,
        entries,
        childEvent.childEventNodes,
        eventItem
      );
    } else {
      entries.push({
        id: `event-async-${childEvent.event.time}`,
        event: childEvent.event,
        task: relations.tasks[childEvent.event.task],
        excluded: childEvent.nodeExcluded,
        async: true,
        parentEvent: parentEvent,
      });
    }
  }
}

function getTasks(
  relations: Relations,
  events: RelatedEvent[],
  timeframes: Record<number, Timeframe>
) {
  if (events.length === 0) {
    return [];
  }
  const taskNodes = getTaskNodes(events, relations, timeframes);
  const tasks: TaskItem[] = [];
  for (const taskNode of taskNodes) {
    const events: EventItem[] = [];
    if (taskNode.rootEventNodes.length !== 0) {
      visitEventNodes(relations, events, taskNode.rootEventNodes, undefined);
    }
    tasks.push({
      id: `task-${taskNode.task.id}`,
      task: taskNode.task,
      events,
    });
  }

  return tasks;
}

function getIndent(
  event: EventItem,
  indents: Map<number, number>,
  excludedIndent: number
): number {
  if (indents.has(event.event.time)) {
    return indents.get(event.event.time)!;
  } else if (event.parentEvent === undefined) {
    const indent = 0;
    indents.set(event.event.time, indent);
    return indent;
  } else {
    const indent =
      getIndent(event.parentEvent, indents, excludedIndent) +
      (event.excluded ? excludedIndent : 1);
    if (!event.async) {
      indents.set(event.event.time, indent);
    }
    return indent;
  }
}

function addEventEntries(
  events: EventItem[],
  entries: EventLogEntry[],
  indents: Map<number, number>,
  excludedIndent = 1
) {
  for (const event of events) {
    if (event.async) {
      entries.push({
        type: 'event-async',
        event: event.event,
        task: event.task,
        indent: getIndent(event, indents, excludedIndent),
        id: event.id,
        excluded: event.excluded,
      });
    } else {
      entries.push({
        type: 'event',
        event: event.event,
        indent: getIndent(event, indents, excludedIndent),
        id: event.id,
        excluded: event.excluded,
      });
    }
  }
}

function addEventEntriesHideExcluded(
  events1: EventItem[],
  entries: EventLogEntry[],
  indents: Map<number, number>
) {
  const groups = partition(events1, (a, b) => a.excluded !== b.excluded);
  for (const group of groups) {
    const firstEvent = group[0];
    if (firstEvent.excluded) {
      entries.push({
        type: 'excluded',
        id: `excluded-${firstEvent.async ? 'async' : ''}-${
          firstEvent.event.time
        }`,
        events: group.map((x) => x.event),
        indent: getIndent(firstEvent, indents, 0),
      });
    } else {
      addEventEntries(group, entries, indents, 0);
    }
  }
}

export function getEventLogEntries(
  relations: Relations,
  events: RelatedEvent[],
  timeframes: Record<number, Timeframe>,
  showExcludedEvents: boolean
) {
  const tasks = getTasks(relations, events, timeframes);
  const entries: EventLogEntry[] = [];
  const indents = new Map<number, number>();
  for (const task of tasks) {
    entries.push({
      type: 'task',
      id: task.id,
      task: task.task,
    });
    if (showExcludedEvents) {
      addEventEntries(task.events, entries, indents);
    } else {
      addEventEntriesHideExcluded(task.events, entries, indents);
    }
  }
  return entries;
}
