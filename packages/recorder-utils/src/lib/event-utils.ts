import { Event } from '@rxjs-insights/recorder';

function isSubscriptionEvent(event: Event) {
  return event.type === 'subscribe' || event.type === 'unsubscribe';
}

function isNotificationEvent(event: Event) {
  return (
    event.type === 'next' || event.type === 'error' || event.type === 'complete'
  );
}

function isInternal(event: Event) {
  return event.target.declaration.internal;
}

export function getPrecedingEvent(event: Event): Event | undefined {
  const precedingEvent = event.precedingEvent;
  return precedingEvent !== undefined
    ? isInternal(precedingEvent)
      ? getPrecedingEvent(precedingEvent)
      : precedingEvent
    : undefined;
}

export function getPrecedingEvents(event: Event): Event[] {
  const precedingEvent = getPrecedingEvent(event);
  return precedingEvent !== undefined ? [precedingEvent] : [];
}

export function getSucceedingEvents(event: Event): Event[] {
  return event.succeedingEvents.flatMap((e) =>
    isInternal(e) ? getSucceedingEvents(e) : [e]
  );
}

export function getSourceEvents(event: Event) {
  return isSubscriptionEvent(event)
    ? getSucceedingEvents(event)
    : getPrecedingEvents(event);
}

export function getDestinationEvents(event: Event) {
  return isSubscriptionEvent(event)
    ? getPrecedingEvents(event)
    : getSucceedingEvents(event);
}

export function getSourceNotifications(event: Event) {
  return isNotificationEvent(event)
    ? getSourceEvents(event).filter(isNotificationEvent)
    : [];
}

export function getDestinationNotifications(event: Event) {
  return isNotificationEvent(event)
    ? getDestinationEvents(event).filter(isNotificationEvent)
    : [];
}
