import { createActions } from '@lib/store';
import { RelatedEvent } from '@app/protocols/insights';

export interface EventsLogActions {
  EventSelected: {
    event: RelatedEvent;
  };
}

export const eventsLogActions =
  createActions<EventsLogActions>('EventsLogActions');
