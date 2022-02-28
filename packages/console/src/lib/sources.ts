import {
  ObservableLike,
  SubscriptionLike,
} from '@rxjs-insights/instrumentation';
import {
  Event,
  Observable,
  Subscriber,
  SubscriberEvent,
} from '@rxjs-insights/recorder';
import { getObservable } from './get-observable';
import { observableConnections, subscriberConnections } from './connections';
import { isObservableTarget, isSubscriberTarget } from './target';
import { getSubscriber } from './get-subscriber';

export function getSourceEvents(event: Event) {
  return event.getSourceEvents();
}

export function subscriberSources(subscriber: Subscriber) {
  subscriberConnections('Source', getSourceEvents, subscriber);
}

export function observableSources(observable: Observable) {
  observableConnections('Source', getSourceEvents, observable);
}

export function sources(target: ObservableLike | SubscriptionLike) {
  if (isSubscriberTarget(target)) {
    subscriberSources(getSubscriber(target));
  } else if (isObservableTarget(target)) {
    observableSources(getObservable(target));
  }
}
