import { createActions } from '@lib/store';

export interface SubscribersGraphActions {
  Expand: {
    target: number;
    key: string;
  };

  ExpandAll: {
    target: number;
    key: string;
  };

  Collapse: {
    target: number;
    key: string;
  };

  CollapseAll: {
    target: number;
    key: string;
  };

  FocusTarget: {
    target: number;
    fromKey?: string;
    toKey?: string;
  };
}

export const subscribersGraphActions =
  createActions<SubscribersGraphActions>('EventsLogActions');
