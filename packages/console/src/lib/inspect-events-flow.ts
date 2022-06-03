import { ObservableLike, SubscriptionLike } from '@rxjs-insights/core';
import { Event, Observable, Subscriber, Task } from '@rxjs-insights/recorder';
import {
  formatEvent,
  formatLabel,
  formatObservable,
  formatSubscriber,
  formatTask,
  formatTaskWithTriggeredEvent,
} from './format';
import { isObservableTarget, isSubscriberTarget } from './target';
import {
  getObservable,
  getPrecedingEvent,
  getPrecedingEvents,
  getSourceEvents,
  getSubscriber,
  getSucceedingEvents,
} from '@rxjs-insights/recorder-utils';

const eventsComparator = (a: Event, b: Event) => a.time - b.time;

function getSources(event: Event) {
  const sources = new Set<Observable | Subscriber>();
  for (let targetEvent of event.target.events) {
    for (let sourceEvent of getSourceEvents(targetEvent)) {
      sources.add(sourceEvent.target);
    }
  }
  return sources;
}

function collectPrecedingEventsEventVisitor(
  event: Event,
  eventsSet: Set<Event>,
  force = false
) {
  if (force || !eventsSet.has(event)) {
    eventsSet.add(event);
    for (let source of getSources(event)) {
      for (let sourceEvent of source.events) {
        if (sourceEvent.time < event.time) {
          collectPrecedingEventsEventVisitor(sourceEvent, eventsSet);
        }
      }
    }
    for (let precedingEvent of getPrecedingEvents(event)) {
      collectPrecedingEventsEventVisitor(precedingEvent, eventsSet);
    }
  }
}

function collectSucceedingEventsEventVisitor(
  event: Event,
  eventsSet: Set<Event>,
  force = false
) {
  if (force || !eventsSet.has(event)) {
    eventsSet.add(event);
    for (let succeedingEvent of getSucceedingEvents(event)) {
      collectSucceedingEventsEventVisitor(succeedingEvent, eventsSet);
    }
  }
}

function collectEvents(target: Observable | Subscriber) {
  const eventsSet = new Set<Event>();

  for (let event of target.events) {
    collectPrecedingEventsEventVisitor(event, eventsSet, true);
    collectSucceedingEventsEventVisitor(event, eventsSet, true);
  }

  const events = Array.from(eventsSet).sort(eventsComparator);
  return { events, eventsSet };
}

function partitionEvents(
  events: Event[],
  partitionFn: (a: Event, b: Event) => boolean
) {
  const parts: Event[][] = [];
  let part: Event[] = [];
  let currentEvent: Event | undefined = undefined;
  for (let event of events) {
    if (currentEvent !== undefined && partitionFn(event, currentEvent)) {
      parts.push(part);
      part = [];
    }
    currentEvent = event;
    part.push(event);
  }
  parts.push(part);
  return parts;
}

function partitionEventsByTask(events: Event[]) {
  return partitionEvents(events, (a, b) => a.task !== b.task);
}

function partitionEventsByExclusion(events: Event[], eventsSet: Set<Event>) {
  return partitionEvents(
    events,
    (a, b) => eventsSet.has(a) !== eventsSet.has(b)
  );
}

function printEvent(
  event: Event,
  target: Observable | Subscriber,
  eventsSet: Set<Event>
) {
  const succeedingEvents = getSucceedingEvents(event);
  if (succeedingEvents.length === 0) {
    console.log(...formatEvent(event, event.target === target));
  } else {
    console.group(...formatEvent(event, event.target === target));
    const parts = partitionEventsByExclusion(succeedingEvents, eventsSet);
    for (let part of parts) {
      const included = eventsSet.has(part[0]);
      if (included) {
        for (let includedEvent of part) {
          if (event.task === includedEvent.task) {
            printEvent(includedEvent, target, eventsSet);
          } else {
            console.log(
              ...formatTaskWithTriggeredEvent(
                includedEvent.task!,
                includedEvent
              )
            );
          }
        }
      } else {
        console.groupCollapsed(
          ...formatLabel(`${part.length} event(s) excluded`)
        );
        for (let excludedEvent of part) {
          if (event.task !== excludedEvent.task) {
            console.group(...formatTask(excludedEvent.task));
          }
          console.log(...formatEvent(excludedEvent, false));
          if (event.task !== excludedEvent.task) {
            console.groupEnd();
          }
        }
        console.groupEnd();
      }
    }

    console.groupEnd();
  }
}

function getTaskRootEvents(
  task: Task | undefined,
  taskEvents: Event[],
  eventsSet: Set<Event>
) {
  const taskRootEvents: Event[] = [];
  for (const taskEvent of taskEvents) {
    const precedingEvent = getPrecedingEvent(taskEvent);
    if (
      precedingEvent === undefined ||
      !eventsSet.has(precedingEvent) ||
      precedingEvent.task !== task
    ) {
      taskRootEvents.push(taskEvent);
    }
  }
  return taskRootEvents;
}

function printTask(
  taskEvents: Event[],
  target: Observable | Subscriber,
  eventsSet: Set<Event>
) {
  const task = taskEvents[0].task;
  const taskRootEvents = getTaskRootEvents(task, taskEvents, eventsSet);

  if (task) {
    console.group(...formatTask(task));
  }

  for (let taskRootEvent of taskRootEvents) {
    printEvent(taskRootEvent, target, eventsSet);
  }

  if (task) {
    console.groupEnd();
  }
}

function targetFlow(target: Observable | Subscriber) {
  const { events, eventsSet } = collectEvents(target);
  const tasks = partitionEventsByTask(events);
  for (const task of tasks) {
    printTask(task, target, eventsSet);
  }
}

export function subscriberFlow(subscriber: Subscriber) {
  console.groupCollapsed(
    ...formatSubscriber(subscriber, true, 'Events flow of:')
  );
  targetFlow(subscriber);
  console.groupEnd();
}

export function observableFlow(observable: Observable) {
  const subscribers = observable.subscribers;
  console.groupCollapsed(
    ...formatObservable(observable, true, 'Events flow of:')
  );
  if (observable.events.length !== 0) {
    console.groupCollapsed(
      ...formatObservable(observable, true, 'Events flow of:')
    );
    targetFlow(observable);
    console.groupEnd();
  }
  for (const subscriber of subscribers) {
    subscriberFlow(subscriber);
  }
  console.groupEnd();
}

/**
 * For the subscriber associated with the `Subscription` or for all subscribers of the `Observable` shows a time-ordered cascade of events that are directly or indirectly related to the events of the target subscriber(s).
 *
 * @param target - the `Subscription` or `Observable` instance to inspect.
 */
export function inspectEventsFlow(target: ObservableLike | SubscriptionLike) {
  if (isSubscriberTarget(target)) {
    subscriberFlow(getSubscriber(target));
  } else if (isObservableTarget(target)) {
    observableFlow(getObservable(target));
  }
}
