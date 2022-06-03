import { ObservableLike, SubscriptionLike } from '@rxjs-insights/core';
import { Event, Observable, Subscriber } from '@rxjs-insights/recorder';
import {
  getObservable,
  getSubscriber,
  isObservableTarget,
  isSubscriberTarget,
} from '@rxjs-insights/recorder-utils';
import {
  formatEvent,
  formatNothingToShow,
  formatObservable,
  formatSubscriber,
} from './format';

function printEvents(events: Event[], label: any[]) {
  console.groupCollapsed(...label);
  if (events.length === 0) {
    console.log(...formatNothingToShow());
  } else {
    for (let event of events) {
      console.log(...formatEvent(event, true));
    }
  }
  console.groupEnd();
}

export function subscriberEvents(subscriber: Subscriber) {
  printEvents(
    subscriber.events,
    formatSubscriber(subscriber, true, 'Events of:')
  );
}

export function observableEvents(observable: Observable) {
  const events = observable.events;
  const subscribers = observable.subscribers;
  console.groupCollapsed(...formatObservable(observable, true, 'Events of:'));
  if (events.length === 0 && subscribers.length === 0) {
    console.log(...formatNothingToShow());
  } else {
    if (events.length !== 0) {
      printEvents(events, formatObservable(observable, true, 'Events of:'));
    }
    for (let subscriber of subscribers) {
      subscriberEvents(subscriber);
    }
  }
  console.groupEnd();
}

/**
 * For the subscriber associated with the `Subscription` or for all subscribers of the `Observable` shows events originating from given subscriber.
 *
 * @param target - the `Subscription` or `Observable` instance to inspect.
 */
export function inspectEvents(target: ObservableLike | SubscriptionLike) {
  if (isSubscriberTarget(target)) {
    subscriberEvents(getSubscriber(target));
  } else if (isObservableTarget(target)) {
    observableEvents(getObservable(target));
  }
}
