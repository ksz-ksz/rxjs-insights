import {
  getMeta,
  hasMeta,
  HasMeta,
  ObservableMeta,
  SubscriberMeta,
} from '@rxjs-insights/core';
import { deref, Observable, Subscriber } from '@rxjs-insights/recorder';

export function isSubscriberTarget(
  target: any
): target is HasMeta<SubscriberMeta> {
  if (hasMeta(target)) {
    const meta = getMeta<SubscriberMeta>(target);
    return 'subscriberRef' in meta;
  } else {
    return false;
  }
}

export function isObservableTarget(
  target: any
): target is HasMeta<ObservableMeta> {
  if (hasMeta(target)) {
    const meta = getMeta<ObservableMeta>(target);
    return 'observableRef' in meta;
  } else {
    return false;
  }
}

export function getSubscriber(target: HasMeta<SubscriberMeta>): Subscriber {
  return deref(getMeta(target).subscriberRef);
}

export function getObservable(target: HasMeta<ObservableMeta>): Observable {
  return deref(getMeta(target).observableRef);
}
