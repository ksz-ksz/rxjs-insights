import { createActions } from '@lib/store';
import { ObservableRef, Ref } from '@app/protocols/refs';

export interface InsightsActions {
  ObservableRefLoaded: {
    ref: ObservableRef | undefined;
  };
}

export const insightsActions =
  createActions<InsightsActions>('InsightsActions');
