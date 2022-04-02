import {
  ObservableLike,
  SubscriptionLike,
} from '@rxjs-insights/instrumentation';
import { isObservableTarget, isSubscriberTarget } from './target';
import { getSubscriber } from './get-subscriber';
import { getObservable } from './get-observable';
import {
  Event,
  Observable,
  ObservableEvent,
  Subscriber,
  SubscriberEvent,
} from '@rxjs-insights/recorder';
import {
  format,
  formatEvent,
  formatObservable,
  formatSubscriber,
  formatTarget,
} from './format';
import { getEventColor } from './colors';
import {
  getLocationString,
  objectTag,
  observableTag,
  TagLike,
  targetTag,
  taskTag,
  textTag,
} from './tag';
import {
  getDestinationEvents,
  getPrecedingEvents,
  getSourceEvents,
  getSucceedingEvents,
} from './event-utils';

function getStatus(subscriber: Subscriber) {
  return (subscriber.events.find(
    (x) =>
      x.declaration.name === 'error' ||
      x.declaration.name === 'complete' ||
      x.declaration.name === 'unsubscribe'
  )?.declaration.name ?? 'next') as
    | 'error'
    | 'complete'
    | 'unsubscribe'
    | 'next';
}

function getStatusDescription(
  status: 'error' | 'complete' | 'unsubscribe' | 'next'
) {
  switch (status) {
    case 'error':
      return 'Inactive (errored)';
    case 'complete':
      return 'Inactive (completed)';
    case 'unsubscribe':
      return 'Inactive (unsubscribed)';
    case 'next':
      return 'Active';
  }
}

function getConnectedSubscriptions(
  subscriber: Subscriber,
  getConnectedEvents: (event: Event) => Event[]
) {
  const subscriptions = new Set<Subscriber>();
  for (const event of subscriber.events) {
    for (const connectedEvent of getConnectedEvents(event)) {
      if (connectedEvent.target instanceof Subscriber) {
        subscriptions.add(connectedEvent.target);
      }
    }
  }
  subscriptions.delete(subscriber);
  return Array.from(subscriptions);
}

function createNumberOfNotificationsGroup(events: Event[]) {
  const next = events.filter((x) => x.declaration.name === 'next').length;
  const error = events.filter((x) => x.declaration.name === 'error').length;
  const complete = events.filter(
    (x) => x.declaration.name === 'complete'
  ).length;
  const total = next + error + complete;
  return {
    tag: objectTag(total),
    group:
      total !== 0
        ? {
            Next:
              next !== 0
                ? {
                    tag: textTag(
                      String(next),
                      `color: ${getEventColor('next')};`
                    ),
                  }
                : undefined,
            Error:
              error !== 0
                ? {
                    tag: textTag(
                      String(error),
                      `color: ${getEventColor('error')};`
                    ),
                  }
                : undefined,
            Complete:
              complete !== 0
                ? {
                    tag: textTag(
                      String(complete),
                      `color: ${getEventColor('complete')};`
                    ),
                  }
                : undefined,
          }
        : undefined,
  };
}

function createNumberOfEventsGroup(events: Event[]) {
  const next = events.filter((x) => x.declaration.name === 'next').length;
  const error = events.filter((x) => x.declaration.name === 'error').length;
  const complete = events.filter(
    (x) => x.declaration.name === 'complete'
  ).length;
  const subscribe = events.filter(
    (x) => x.declaration.name === 'subscribe'
  ).length;
  const unsubscribe = events.filter(
    (x) => x.declaration.name === 'unsubscribe'
  ).length;
  const total = next + error + complete + subscribe + unsubscribe;
  return {
    tag: objectTag(total),
    group:
      total !== 0
        ? {
            Next:
              next !== 0
                ? {
                    tag: textTag(
                      String(next),
                      `color: ${getEventColor('next')};`
                    ),
                  }
                : undefined,
            Error:
              error !== 0
                ? {
                    tag: textTag(
                      String(error),
                      `color: ${getEventColor('error')};`
                    ),
                  }
                : undefined,
            Complete:
              complete !== 0
                ? {
                    tag: textTag(
                      String(complete),
                      `color: ${getEventColor('complete')};`
                    ),
                  }
                : undefined,
            Subscribe:
              subscribe !== 0
                ? {
                    tag: textTag(
                      String(subscribe),
                      `color: ${getEventColor('subscribe')};`
                    ),
                  }
                : undefined,
            Unsubscribe:
              unsubscribe !== 0
                ? {
                    tag: textTag(
                      String(unsubscribe),
                      `color: ${getEventColor('unsubscribe')};`
                    ),
                  }
                : undefined,
          }
        : undefined,
  };
}

function createNumberOfSubscriptionsGroup(subscriptions: Subscriber[]) {
  const total = subscriptions.length;
  const subscriberStatuses = subscriptions.map(getStatus);
  const active = subscriberStatuses.filter((x) => x === 'next').length;
  const errored = subscriberStatuses.filter((x) => x === 'error').length;
  const completed = subscriberStatuses.filter((x) => x === 'complete').length;
  const unsubscribed = subscriberStatuses.filter(
    (x) => x === 'unsubscribe'
  ).length;

  return {
    tag: objectTag(total),
    group:
      total !== 0
        ? {
            Active:
              active !== 0
                ? {
                    tag: textTag(
                      String(active),
                      `color: ${getEventColor('next')};`
                    ),
                  }
                : undefined,
            Errored:
              errored !== 0
                ? {
                    tag: textTag(
                      String(errored),
                      `color: ${getEventColor('error')};`
                    ),
                  }
                : undefined,
            Completed:
              completed !== 0
                ? {
                    tag: textTag(
                      String(completed),
                      `color: ${getEventColor('complete')};`
                    ),
                  }
                : undefined,
            Unsubscribed:
              unsubscribed !== 0
                ? {
                    tag: textTag(
                      String(unsubscribed),
                      `color: ${getEventColor('unsubscribe')};`
                    ),
                  }
                : undefined,
          }
        : undefined,
  };
}

interface Printable {
  tag: TagLike;
  group?: PrintableGroup;
}

interface PrintableGroup {
  [name: string]: Printable | undefined;
}

function printGroup(group: PrintableGroup) {
  const entries = Object.entries(group).filter(
    ([, value]) => value !== undefined
  ) as Array<[string, Printable]>;
  const maxLabelLength = Math.max(...entries.map(([label]) => label.length));
  for (let [label, printable] of entries) {
    if (printable.group) {
      const labelTag = textTag(
        `${label.padEnd(maxLabelLength + 1, '.')}:`,
        'font-weight: 400;'
      );
      console.groupCollapsed(...format(labelTag, printable.tag));
      printGroup(printable.group);
      console.groupEnd();
    } else {
      const labelTag = textTag(
        ` ${label.padEnd(maxLabelLength + 1, '.')}:`,
        'font-weight: 400;'
      );
      console.log(...format('', labelTag, printable.tag));
    }
  }
}

function eventInfo(event: Event, targetLabel: string) {
  const declaration = event.declaration;
  const { originalLocation, generatedLocation } = declaration.locations;

  console.groupCollapsed(...formatEvent(event, true, 'Summary of:'));
  printGroup({
    'ID / Virtual time': { tag: objectTag(event.time) },
    Name: { tag: objectTag(declaration.name) },
    Function: { tag: objectTag(declaration.func) },
    Arguments: { tag: objectTag(declaration.args, true) },
    [targetLabel]: { tag: targetTag(event.target, true) },
    'Original location': originalLocation
      ? { tag: getLocationString(originalLocation) }
      : undefined,
    'Generated location': generatedLocation
      ? { tag: getLocationString(generatedLocation) }
      : undefined,
    Task: { tag: taskTag(event.task) },
    'Preceding events': createNumberOfEventsGroup(getPrecedingEvents(event)),
    'Succeeding events': createNumberOfEventsGroup(getSucceedingEvents(event)),
  });
  console.groupEnd();
}

export function subscriberEventInfo(event: SubscriberEvent) {
  eventInfo(event, 'Subscriber');
}

export function observableEventInfo(event: ObservableEvent) {
  eventInfo(event, 'Observable');
}

export function subscriberInfo(subscriber: Subscriber) {
  const status = getStatus(subscriber);
  const statusDescription = getStatusDescription(status);
  const statusColor = getEventColor(status);
  const declaration = subscriber.declaration;
  const { originalLocation, generatedLocation } = declaration.locations;
  const sourceSubscriptions = getConnectedSubscriptions(
    subscriber,
    getSourceEvents
  );
  const destinationSubscriptions = getConnectedSubscriptions(
    subscriber,
    getDestinationEvents
  );

  console.groupCollapsed(...formatSubscriber(subscriber, true, 'Summary of:'));
  printGroup({
    ID: { tag: objectTag(subscriber.id) },
    Name: { tag: objectTag(declaration.name) },
    Constructor: { tag: objectTag(declaration.func) },
    Arguments: { tag: objectTag(declaration.args, true) },
    'Original location': originalLocation
      ? { tag: getLocationString(originalLocation) }
      : undefined,
    'Generated location': generatedLocation
      ? { tag: getLocationString(generatedLocation) }
      : undefined,
    Status: { tag: textTag(statusDescription, `color: ${statusColor};`) },
    Notifications: createNumberOfNotificationsGroup(subscriber.events),
    'Source subscriptions':
      createNumberOfSubscriptionsGroup(sourceSubscriptions),
    'Destination subscriptions': createNumberOfSubscriptionsGroup(
      destinationSubscriptions
    ),
  });
  console.groupEnd();
}

export function observableInfo(observable: Observable) {
  const subscriptions = observable.subscribers;
  const declaration = observable.declaration;
  const { originalLocation, generatedLocation } = declaration.locations;

  console.groupCollapsed(...formatObservable(observable, true, 'Summary of:'));
  printGroup({
    ID: { tag: objectTag(observable.id) },
    Name: { tag: objectTag(declaration.name) },
    Constructor: { tag: objectTag(declaration.func) },
    Arguments: { tag: objectTag(declaration.args, true) },
    'Original location': originalLocation
      ? { tag: getLocationString(originalLocation) }
      : undefined,
    'Generated location': generatedLocation
      ? { tag: getLocationString(generatedLocation) }
      : undefined,
    'Source observable': observable.sourceObservable
      ? { tag: observableTag(observable.sourceObservable) }
      : undefined,
    Calls: createNumberOfNotificationsGroup(observable.events),
    Subscriptions: createNumberOfSubscriptionsGroup(subscriptions),
  });
  console.groupEnd();
}

/**
 * Shows the detailed info about the target.
 *
 * @param target - the `Subscription` or `Observable` instance to inspect.
 */
export function inspect(target: ObservableLike | SubscriptionLike) {
  if (isSubscriberTarget(target)) {
    subscriberInfo(getSubscriber(target));
  } else if (isObservableTarget(target)) {
    observableInfo(getObservable(target));
  }
}
