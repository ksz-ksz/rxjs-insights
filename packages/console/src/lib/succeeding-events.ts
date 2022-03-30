import {
  ObservableLike,
  SubscriptionLike,
} from '@rxjs-insights/instrumentation';
import { Event, Observable, Subscriber } from '@rxjs-insights/recorder';
import { getObservable } from './get-observable';
import {
  eventConnectedEvents,
  observableConnectedEvents,
  subscriberConnectedEvents,
} from './connected-events';
import { isObservableTarget, isSubscriberTarget } from './target';
import { getSubscriber } from './get-subscriber';
import { getSucceedingEvents } from './event-utils';

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
export function succeedingEvents(target: ObservableLike | SubscriptionLike) {
  if (isSubscriberTarget(target)) {
    subscriberSucceedingEvents(getSubscriber(target));
  } else if (isObservableTarget(target)) {
    observableSucceedingEvents(getObservable(target));
  }
}
