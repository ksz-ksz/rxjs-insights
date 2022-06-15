import { createActions } from '@lib/store';

export interface SubscribersGraphActions {
  Toggle: {
    target: number; // TODO: rename: root
    key: string;
    id: number;
  };
}

export const subscribersGraphActions =
  createActions<SubscribersGraphActions>('EventsLogActions');
