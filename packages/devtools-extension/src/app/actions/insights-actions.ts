import { createActions } from '@lib/store';
import { ObservableInfo } from '@app/protocols/insights';

export interface InsightsActions {
  ObservableInfoLoaded: {
    info: ObservableInfo | undefined;
  };
}

export const insightsActions =
  createActions<InsightsActions>('InsightsActions');
