import { createActions } from '@lib/store';
import { RelatedTarget } from '@app/protocols/insights';

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
    target: RelatedTarget;
    fromKey: string;
    toKey: string;
  };

  FollowEvent: void;

  UnfollowEvent: void;

  TargetHovered: { target: RelatedTarget };

  TargetUnhovered: { target: RelatedTarget };
}

export const subscribersGraphActions =
  createActions<SubscribersGraphActions>('EventsLogActions');
