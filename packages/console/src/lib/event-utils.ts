import { Event } from '@rxjs-insights/recorder';

function isSubscriptionEvent(event: Event) {
  return (
    event.declaration.name === 'subscribe' ||
    event.declaration.name === 'unsubscribe'
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
