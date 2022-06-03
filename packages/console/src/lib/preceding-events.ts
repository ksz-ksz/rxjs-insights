import { ObservableLike, SubscriptionLike } from '@rxjs-insights/core';
import { Event, Observable, Subscriber } from '@rxjs-insights/recorder';
import {
  getObservable,
  getPrecedingEvents,
  getSubscriber,
  isObservableTarget,
  isSubscriberTarget,
} from '@rxjs-insights/recorder-utils';
import {
  eventConnectedEvents,
  observableConnectedEvents,
  subscriberConnectedEvents,
} from './connected-events';

export function eventPrecedingEvents(
  event: Event,
  target?: Observable | Subscriber
) {
  eventConnectedEvents('Preceding', getPrecedingEvents, event, target);
}

export function subscriberPrecedingEvents(subscriber: Subscriber) {
  subscriberConnectedEvents('Preceding', getPrecedingEvents, subscriber);
}

export function observablePrecedingEvents(observable: Observable) {
  observableConnectedEvents('Preceding', getPrecedingEvents, observable);
}

/**
 * For each event of the subscriber associated with the `Subscription` or for all subscribers of the `Observable` shows a tree of events that precede given event.
 *
 * @param target - the `Subscription` or `Observable` instance to inspect.
 */
export function inspectPrecedingEvents(
  target: ObservableLike | SubscriptionLike
) {
  if (isSubscriberTarget(target)) {
    subscriberPrecedingEvents(getSubscriber(target));
  } else if (isObservableTarget(target)) {
    observablePrecedingEvents(getObservable(target));
  }
}
