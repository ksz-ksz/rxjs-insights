import {
  ObservableLike,
  SubscriptionLike,
} from '@rxjs-insights/instrumentation';
import { Event, Observable, Subscriber } from '@rxjs-insights/recorder';
import { getObservable } from './get-observable';
import { observableConnections, subscriberConnections } from './connections';
import { isObservableTarget, isSubscriberTarget } from './target';
import { getSubscriber } from './get-subscriber';

export function getDestinationEvents(event: Event) {
  return event.getDestinationEvents();
}

export function subscriberDestinations(subscriber: Subscriber) {
  subscriberConnections('Destination', getDestinationEvents, subscriber);
}

export function observableDestinations(observable: Observable) {
  observableConnections('Destination', getDestinationEvents, observable);
}

export function destinations(target: ObservableLike | SubscriptionLike) {
  if (isSubscriberTarget(target)) {
    subscriberDestinations(getSubscriber(target));
  } else if (isObservableTarget(target)) {
    observableDestinations(getObservable(target));
  }
}
