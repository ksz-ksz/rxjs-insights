import {
  combineReactions,
  createReaction,
  createSelector,
  Store,
} from '@lib/store';
import { concatMap, distinctUntilChanged, EMPTY, of } from 'rxjs';
import { activeTargetStateSelector } from '@app/selectors/active-target-state-selector';
import { timeSelector } from '@app/selectors/insights-selectors';
import { RouterSlice } from '@app/store/router';
import { InsightsSlice } from '@app/store/insights';
import { refreshRefsActions } from '@app/actions/refresh-refs-actions';

const activeTargetSelector = createSelector(
  [activeTargetStateSelector],
  ([activeTargetState]) => {
    if (activeTargetState) {
      const { target } = activeTargetState;
      return target;
    } else {
      return undefined;
    }
  }
);

const activeEventSelector = createSelector(
  [activeTargetStateSelector, timeSelector],
  ([activeTargetState, time]) => {
    if (activeTargetState) {
      const { relations } = activeTargetState!;
      return relations.events[time];
    }
  }
);

export const refreshRefsReaction = combineReactions()
  .add(
    createReaction(
      (action$, { activeTarget$ }) =>
        activeTarget$.pipe(
          concatMap((target) => {
            if (target) {
              return of(
                refreshRefsActions.LoadExpanded({
                  stateKey: 'context-target',
                  ref: target,
                  path: 'root',
                })
              );
            } else {
              return EMPTY;
            }
          })
        ),
      (store: Store<RouterSlice & InsightsSlice>) => ({
        activeTarget$: store
          .select(activeTargetSelector)
          .pipe(distinctUntilChanged()),
      })
    )
  )
  .add(
    createReaction(
      (action$, { activeEvent$ }) =>
        activeEvent$.pipe(
          concatMap((event) => {
            if (event) {
              return of(
                refreshRefsActions.LoadExpanded({
                  stateKey: 'context-event',
                  ref: event,
                  path: 'root',
                })
              );
            } else {
              return EMPTY;
            }
          })
        ),
      (store: Store<RouterSlice & InsightsSlice>) => ({
        activeEvent$: store
          .select(activeEventSelector)
          .pipe(distinctUntilChanged()),
      })
    )
  );
