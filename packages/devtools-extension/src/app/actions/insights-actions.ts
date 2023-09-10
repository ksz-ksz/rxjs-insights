import { createActions } from '@lib/state-fx/store';
import { RelatedEvent, TargetState } from '@app/protocols/insights';

export interface InsightsActions {
  TargetStateLoaded: {
    state: TargetState | undefined;
  };
  PlayNextEvent: {
    event: RelatedEvent;
  };
  PlayDone: void;
}

export const insightsActions = createActions<InsightsActions>({
  namespace: 'InsightsActions',
});
