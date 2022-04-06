import { Event, Observable, Subscriber } from '@rxjs-insights/recorder';
import {
  formatEvent,
  formatNothingToShow,
  formatObservable,
  formatSubscriber,
  formatTask,
} from './format';
import { getPrecedingEvent } from './event-utils';

function eventConnections(
  direction: 'Preceding' | 'Succeeding',
  getConnectedEvents: (event: Event) => Event[],
  event: Event,
  target?: Observable | Subscriber,
  top = false
) {
  const source = direction === 'Preceding';
  const destination = direction === 'Succeeding';
  const precedingEvent = getPrecedingEvent(event);
  const task =
    precedingEvent !== undefined && event.task !== precedingEvent.task;
  const outerTask = task && destination && !top;
  const innerTask = task && source;
  if (outerTask) {
    console.group(...formatTask(event.task));
  }
  const relatedEvents = getConnectedEvents(event);
  if (relatedEvents.length === 0) {
    console.log(...formatEvent(event, event.target === target));
  } else {
    console.group(...formatEvent(event, event.target === target));
    if (innerTask) {
      console.group(...formatTask(event.task));
    }
    for (const relatedEvent of relatedEvents) {
      eventConnections(direction, getConnectedEvents, relatedEvent, target);
    }
    if (innerTask) {
      console.groupEnd();
    }
    console.groupEnd();
  }
  if (outerTask) {
    console.groupEnd();
  }
}

export function eventConnectedEvents(
  direction: 'Preceding' | 'Succeeding',
  getConnectedEvents: (event: Event) => Event[],
  event: Event,
  target?: Observable | Subscriber
) {
  console.groupCollapsed(
    ...formatEvent(event, event.target === target, `${direction} events of:`)
  );
  eventConnections(direction, getConnectedEvents, event, target);
  console.groupEnd();
}

export function subscriberConnectedEvents(
  direction: 'Preceding' | 'Succeeding',
  getConnectedEvents: (event: Event) => Event[],
  subscriber: Subscriber
) {
  const events = subscriber.events;
  console.groupCollapsed(
    ...formatSubscriber(subscriber, true, `${direction} events of:`)
  );
  if (events.length === 0) {
    console.log(...formatNothingToShow());
  } else {
    for (const event of events) {
      eventConnections(direction, getConnectedEvents, event, subscriber, true);
    }
  }
  console.groupEnd();
}

export function observableConnectedEvents(
  direction: 'Preceding' | 'Succeeding',
  getConnectedEvents: (event: Event) => Event[],
  observable: Observable
) {
  const subscribers = observable.subscribers;
  console.groupCollapsed(
    ...formatObservable(observable, true, `${direction} events of:`)
  );
  if (subscribers.length === 0) {
    console.log(...formatNothingToShow());
  } else {
    for (const subscriber of subscribers) {
      subscriberConnectedEvents(direction, getConnectedEvents, subscriber);
    }
  }

  console.groupEnd();
}
