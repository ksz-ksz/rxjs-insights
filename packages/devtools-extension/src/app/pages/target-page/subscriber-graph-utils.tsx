import { Theme } from '@mui/material';
import { RelatedEvent, RelatedTarget } from '@app/protocols/insights';

export function getTargetColors(theme: Theme, target: RelatedTarget) {
  switch (target.type) {
    case 'observable':
      return theme.insights.observable;
    case 'subscriber':
      return theme.insights.subscriber;
    case 'caller':
      return theme.insights.caller;
  }
}

export function getEventColors(theme: Theme, event: RelatedEvent) {
  switch (event.eventType) {
    case 'next':
      return theme.insights.event.next;
    case 'error':
      return theme.insights.event.error;
    case 'complete':
      return theme.insights.event.complete;
    case 'subscribe':
    case 'unsubscribe':
      return theme.insights.event.subscription;
  }
}

export function getDirection(
  type: 'next' | 'error' | 'complete' | 'subscribe' | 'unsubscribe'
) {
  switch (type) {
    case 'next':
    case 'error':
    case 'complete':
      return 1;
    case 'subscribe':
    case 'unsubscribe':
      return -1;
  }
}
