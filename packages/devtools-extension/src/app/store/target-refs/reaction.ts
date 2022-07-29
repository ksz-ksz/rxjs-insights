import {
  combineReactions,
  createReaction,
  createSelector,
  Store,
} from '@lib/store';
import { concatMap, distinctUntilChanged, EMPTY, of } from 'rxjs';
import { refOutletActions } from '@app/actions/ref-outlet-actions';
import { refUiStateSelector } from '@app/selectors/refs-selectors';
import { RefsSlice } from '@app/store/refs';
import { activeTargetStateSelector } from '@app/selectors/active-target-state-selector';
import { timeSelector } from '@app/selectors/insights-selectors';
import { RouterSlice } from '@app/store/router';
import { InsightsSlice } from '@app/store/insights';
import { inspect } from '@rxjs-insights/console';
import { RelatedEvent, RelatedTarget } from '@app/protocols/insights';

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

export const targetRefsReaction = combineReactions()
  .add(
    createReaction(
      (action$, { activeTarget$, isExpanded }) =>
        activeTarget$.pipe(
          concatMap((target: RelatedTarget) => {
            if (target && isExpanded('context-target')) {
              return of(
                refOutletActions.Expand({
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
      (store: Store<RouterSlice & InsightsSlice & RefsSlice>) => ({
        activeTarget$: store
          .select(activeTargetSelector)
          .pipe(distinctUntilChanged()),
        isExpanded(stateKey: string) {
          return store
            .select(refUiStateSelector(stateKey))
            .get()
            .expandedPaths.has('root');
        },
      })
    )
  )
  .add(
    createReaction(
      (action$, { activeEvent$, isExpanded }) =>
        activeEvent$.pipe(
          concatMap((event: RelatedEvent) => {
            if (event && isExpanded('context-event')) {
              return of(
                refOutletActions.Expand({
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
      (store: Store<RouterSlice & InsightsSlice & RefsSlice>) => ({
        activeEvent$: store
          .select(activeEventSelector)
          .pipe(distinctUntilChanged()),
        isExpanded(stateKey: string) {
          return store
            .select(refUiStateSelector(stateKey))
            .get()
            .expandedPaths.has('root');
        },
      })
    )
  );
