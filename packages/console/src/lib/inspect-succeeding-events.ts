import { ObservableLike, SubscriptionLike } from '@rxjs-insights/core';
import { Event, Observable, Subscriber } from '@rxjs-insights/recorder';
import {
  getObservable,
  getSubscriber,
  getSucceedingEvents,
  isObservableTarget,
  isSubscriberTarget,
} from '@rxjs-insights/recorder-utils';
import {
  eventConnectedEvents,
  observableConnectedEvents,
  subscriberConnectedEvents,
} from './connected-events';

export function eventSucceedingEvents(
  event: Event,
  target?: Observable | Subscriber
) {
  eventConnectedEvents('Succeeding', getSucceedingEvents, event, target);
}

export function subscriberSucceedingEvents(subscriber: Subscriber) {
  subscriberConnectedEvents('Succeeding', getSucceedingEvents, subscriber);
}

export function observableSucceedingEvents(observable: Observable) {
  observableConnectedEvents('Succeeding', getSucceedingEvents, observable);
}

/**
 * For each event of the subscriber associated with the `Subscription` or for all subscribers of the `Observable` shows a tree of events that succeed given event.
 *
 * @param target - the `Subscription` or `Observable` instance to inspect.
 */
export function inspectSucceedingEvents(
  target: ObservableLike | SubscriptionLike
) {
  if (isSubscriberTarget(target)) {
    subscriberSucceedingEvents(getSubscriber(target));
  } else if (isObservableTarget(target)) {
    observableSucceedingEvents(getObservable(target));
  }
}
