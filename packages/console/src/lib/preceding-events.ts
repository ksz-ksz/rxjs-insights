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

export function getPrecedingEvents(event: Event): Event[] {
  return event.getPrecedingEvents();
}

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

export function precedingEvents(target: ObservableLike | SubscriptionLike) {
  if (isSubscriberTarget(target)) {
    subscriberPrecedingEvents(getSubscriber(target));
  } else if (isObservableTarget(target)) {
    observablePrecedingEvents(getObservable(target));
  }
}
