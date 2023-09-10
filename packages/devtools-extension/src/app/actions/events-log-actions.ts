import { createActions } from '@lib/state-fx/store';
import { RelatedEvent } from '@app/protocols/insights';

export interface EventsLogActions {
  EventSelected: {
    event: RelatedEvent;
  };
  Play: {
    events: RelatedEvent[];
  };
  Pause: void;
}

export const eventsLogActions = createActions<EventsLogActions>({
  namespace: 'EventsLogActions',
});
