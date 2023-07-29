import { createActions } from '@lib/state-fx/store';
import { RelatedTarget } from '@app/protocols/insights';

export const uiActions = createActions<{
  TargetHoveredOnGraph: { target: RelatedTarget };
  TargetUnhoveredOnGraph: { target: RelatedTarget };
}>({ namespace: 'ui' });
