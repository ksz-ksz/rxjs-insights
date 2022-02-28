import {
  Event,
  Observable,
  ObservableEvent,
  Subscriber,
  SubscriberEvent,
  Task,
} from '@rxjs-insights/recorder';
import {
  dataTag,
  eventTag,
  getLocationsString,
  labelTag,
  objectTag,
  observableTag,
  subscriberTag,
  TagLike,
  tags,
  taskTag,
} from './tag';
import {
  ObservableEventMore,
  ObservableMore,
  SubscriberMore,
  SubscriptionEventMore,
} from './menu';

function format(...input: TagLike[]): any[] {
  const tag = tags(...input);
  return [tag.format, ...tag.args];
}

export function formatTarget(
  x: Observable | Subscriber,
  target = false,
  label?: string
) {
  if (x instanceof Observable) {
    return formatObservable(x, target, label);
  } else {
    return formatSubscriber(x, target, label);
  }
}

export function formatObservable(
  observable: Observable,
  target = false,
  label?: string
) {
  return format(
    labelTag(label),
    observableTag(observable, target),
    getLocationsString(observable.declaration.locations),
    objectTag(new ObservableMore.More(observable))
  );
}

export function formatSubscriber(
  subscriber: Subscriber,
  target = false,
  label?: string
) {
  return format(
    labelTag(label),
    subscriberTag(subscriber, target),
    getLocationsString(subscriber.observable.declaration.locations),
    objectTag(new SubscriberMore.More(subscriber))
  );
}

export function formatEvent(event: Event, target = false, label?: string) {
  return format(
    labelTag(label),
    eventTag(event, target),
    event instanceof ObservableEvent
      ? observableTag(event.observable, target)
      : event instanceof SubscriberEvent
      ? subscriberTag(event.subscriber, target)
      : undefined,
    dataTag(event),
    event instanceof ObservableEvent
      ? objectTag(new ObservableEventMore.More(event))
      : event instanceof SubscriberEvent
      ? objectTag(new SubscriptionEventMore.More(event))
      : undefined
  );
}

export function formatTask(task: Task) {
  return format(taskTag(task));
}

export function formatTaskWithTriggeredEvent(task: Task, triggered?: Event) {
  if (triggered !== undefined) {
    return format(taskTag(task), '🠖', eventTag(triggered));
  } else {
    return formatTask(task);
  }
}

export function formatNothingToShow() {
  return formatLabel('Nothing to show');
}

export function formatLabel(label: string) {
  return format(labelTag(label));
}
