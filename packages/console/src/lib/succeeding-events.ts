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

export function getSucceedingEvents(event: Event): Event[] {
  return event.getSucceedingEvents();
}

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

export function succeedingEvents(target: ObservableLike | SubscriptionLike) {
  if (isSubscriberTarget(target)) {
    subscriberSucceedingEvents(getSubscriber(target));
  } else if (isObservableTarget(target)) {
    observableSucceedingEvents(getObservable(target));
  }
}
