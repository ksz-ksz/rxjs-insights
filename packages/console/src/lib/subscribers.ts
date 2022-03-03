import {
  ObservableLike,
  SubscriptionLike,
} from '@rxjs-insights/instrumentation';
import { Observable, Subscriber } from '@rxjs-insights/recorder';
import { getObservable } from './get-observable';
import {
  formatNothingToShow,
  formatObservable,
  formatSubscriber,
} from './format';
import { isObservableTarget, isSubscriberTarget } from './target';
import { getSubscriber } from './get-subscriber';

export function subscriberSubscribers(subscriber: Subscriber) {
  console.groupCollapsed(
    ...formatSubscriber(subscriber, true, 'Subscribers of:')
  );
  console.log(...formatSubscriber(subscriber, true));
  console.groupEnd();
}

export function observableSubscribers(observable: Observable) {
  const subscribers = observable.subscribers;
  console.groupCollapsed(
    ...formatObservable(observable, true, 'Subscribers of:')
  );
  if (subscribers.length === 0) {
    console.log(...formatNothingToShow());
  } else {
    for (let instance of subscribers) {
      console.log(...formatSubscriber(instance, true));
    }
  }
  console.groupEnd();
}

export function subscribers(target: ObservableLike | SubscriptionLike) {
  if (isSubscriberTarget(target)) {
    subscriberSubscribers(getSubscriber(target));
  } else if (isObservableTarget(target)) {
    observableSubscribers(getObservable(target));
  }
}
