import { ObservableLike, SubscriptionLike } from '@rxjs-insights/core';
import { Observable, Subscriber } from '@rxjs-insights/recorder';
import { getObservable } from './get-observable';
import { observableConnections, subscriberConnections } from './connections';
import { isObservableTarget, isSubscriberTarget } from './target';
import { getSubscriber } from './get-subscriber';
import { getSourceEvents } from './event-utils';

export function subscriberSources(subscriber: Subscriber) {
  subscriberConnections('Source', getSourceEvents, subscriber);
}

export function observableSources(observable: Observable) {
  observableConnections('Source', getSourceEvents, observable);
}

/**
 * For the subscriber associated with the `Subscription` or for all subscribers of the `Observable` shows a tree of source subscribers, i.e. subscribers that sent an event to the succeeding subscriber.
 *
 * @param target - the `Subscription` or `Observable` instance to inspect.
 */
export function inspectSources(target: ObservableLike | SubscriptionLike) {
  if (isSubscriberTarget(target)) {
    subscriberSources(getSubscriber(target));
  } else if (isObservableTarget(target)) {
    observableSources(getObservable(target));
  }
}
