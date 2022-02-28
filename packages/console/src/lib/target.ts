import {
  getMeta,
  hasAnyMeta,
  HasMeta,
  ObservableMeta,
  SubscriberMeta,
} from '@rxjs-insights/instrumentation';

export function isSubscriberTarget(
  target: any
): target is HasMeta<SubscriberMeta> {
  if (hasAnyMeta(target)) {
    const meta = getMeta<SubscriberMeta>(target);
    return 'subscriberRef' in meta;
  } else {
    return false;
  }
}

export function isObservableTarget(
  target: any
): target is HasMeta<ObservableMeta> {
  if (hasAnyMeta(target)) {
    const meta = getMeta<ObservableMeta>(target);
    return 'observableRef' in meta;
  } else {
    return false;
  }
}
