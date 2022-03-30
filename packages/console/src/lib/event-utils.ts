import { Event } from '@rxjs-insights/recorder';

function isSubscriptionEvent(event: Event) {
  return (
    event.declaration.name === 'subscribe' ||
    event.declaration.name === 'unsubscribe'
  );
}

export function getPrecedingEvents(event: Event) {
  return event.precedingEvent ? [event.precedingEvent] : [];
}

export function getSucceedingEvents(event: Event) {
  return event.succeedingEvents;
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
