import { createReaction, select, Store } from '@lib/store';
import { distinctUntilChanged, map } from 'rxjs';
import { RouterSlice } from '@app/store/router';
import { activeTargetSelector } from '@app/selectors/targets-selectors';
import { activeTargetActions } from '@app/actions/active-target-actions';
import { TargetsSlice } from '@app/store/targets';
import { RefsSlice } from '@app/store/refs';

export const activeTargetReaction = createReaction(
  (action$, { activeTarget$ }) =>
    activeTarget$.pipe(
      distinctUntilChanged(),
      map((target) => activeTargetActions.ActiveTargetChanged({ target }))
    ),
  (store: Store<RouterSlice & TargetsSlice & RefsSlice>) => ({
    activeTarget$: store.pipe(select(activeTargetSelector)),
  })
);
