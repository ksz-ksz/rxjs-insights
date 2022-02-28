import { Event, Observable, Subscriber } from '@rxjs-insights/recorder';
import {
  formatNothingToShow,
  formatObservable,
  formatSubscriber,
  formatTarget,
} from './format';

function groupEventsByTarget(events: Event[]) {
  const groups = new Map<Observable | Subscriber, Event[]>();
  for (let event of events) {
    const group = groups.get(event.getTarget());
    if (group) {
      group.push(event);
    } else {
      groups.set(event.getTarget(), [event]);
    }
  }
  return groups;
}

function printConnections(
  getConnectedEvents: (event: Event) => Event[],
  target: Observable | Subscriber,
  events: Event[],
  primaryTarget: Observable | Subscriber = target,
  targetsSet = new Set<Observable | Subscriber>()
) {
  if (targetsSet.has(target)) {
    console.log(...formatTarget(target, target === primaryTarget, 'recursive'));
  } else {
    targetsSet.add(target);
    const groups = groupEventsByTarget(events);
    groups.delete(target);

    if (groups.size === 0) {
      console.log(...formatTarget(target, target === primaryTarget));
    } else {
      console.group(...formatTarget(target, target === primaryTarget));
      for (const [connection, events] of groups) {
        printConnections(
          getConnectedEvents,
          connection,
          events.flatMap(getConnectedEvents),
          primaryTarget,
          targetsSet
        );
      }
      console.groupEnd();
    }
    targetsSet.delete(target);
  }
}

export function subscriberConnections(
  direction: 'Source' | 'Destination',
  getConnectedEvents: (event: Event) => Event[],
  target: Subscriber,
  primaryTarget: Subscriber = target
) {
  console.groupCollapsed(
    ...formatSubscriber(target, target === primaryTarget, `${direction}s of:`)
  );
  printConnections(
    getConnectedEvents,
    target,
    target.events.flatMap(getConnectedEvents),
    primaryTarget
  );
  console.groupEnd();
}

export function observableConnections(
  direction: 'Source' | 'Destination',
  getConnectedEvents: (event: Event) => Event[],
  target: Observable
) {
  const subscribers = target.subscribers;
  console.groupCollapsed(
    ...formatObservable(target, true, `${direction}s of:`)
  );
  if (subscribers.length === 0) {
    console.log(...formatNothingToShow());
  } else {
    for (const subscriber of subscribers) {
      subscriberConnections(direction, getConnectedEvents, subscriber);
    }
  }
  console.groupEnd();
}
