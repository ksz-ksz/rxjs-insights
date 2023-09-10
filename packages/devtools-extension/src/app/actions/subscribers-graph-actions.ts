import { createActions } from '@lib/state-fx/store';
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
    fromKey: string;
    fromTarget: RelatedTarget;
    toKey: string;
    toTarget: RelatedTarget;
  };

  FollowEvent: void;

  UnfollowEvent: void;

  HideExcludedEvents: void;

  ShowExcludedEvents: void;

  TargetHovered: { target: RelatedTarget };

  TargetUnhovered: { target: RelatedTarget };
}

export const subscribersGraphActions = createActions<SubscribersGraphActions>({
  namespace: 'EventsLogActions',
});
