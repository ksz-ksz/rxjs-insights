import { ObservableLike, SubscriptionLike } from '@rxjs-insights/core';
import { Observable, Subscriber } from '@rxjs-insights/recorder';
import {
  getDestinationEvents,
  getObservable,
  getSubscriber,
  isObservableTarget,
  isSubscriberTarget,
} from '@rxjs-insights/recorder-utils';
import { observableConnections, subscriberConnections } from './connections';

export function subscriberDestinations(subscriber: Subscriber) {
  subscriberConnections('Destination', getDestinationEvents, subscriber);
}

export function observableDestinations(observable: Observable) {
  observableConnections('Destination', getDestinationEvents, observable);
}

/**
 * For the subscriber associated with the `Subscription` or for all subscribers of the `Observable` shows a tree of destination subscribers, i.e. subscribers that received an event from the preceding subscriber.
 *
 * @param target - the `Subscription` or `Observable` instance to inspect.
 */
export function inspectDestinations(target: ObservableLike | SubscriptionLike) {
  if (isSubscriberTarget(target)) {
    subscriberDestinations(getSubscriber(target));
  } else if (isObservableTarget(target)) {
    observableDestinations(getObservable(target));
  }
}
