import {
  combineReactions,
  createReaction,
  createSelector,
  filterActions,
  Store,
} from '@lib/store';
import { concatMap, distinctUntilChanged, EMPTY, of } from 'rxjs';
import { activeTargetStateSelector } from '@app/selectors/active-target-state-selector';
import { timeSelector } from '@app/selectors/insights-selectors';
import { RouterSlice } from '@app/store/router';
import { InsightsSlice } from '@app/store/insights';
import { refreshRefsActions } from '@app/actions/refresh-refs-actions';
import { appBarActions } from '@app/actions/app-bar-actions';
import { Ref } from '@app/protocols/refs';

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

const activeRelatedTargetsSelector = createSelector(
  [activeTargetStateSelector],
  ([activeTargetState]) => {
    if (activeTargetState) {
      const { relations } = activeTargetState!;
      return Object.values(relations.targets);
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
  )
  .add(
    createReaction(
      (action$, { getRefsToRefresh }) => {
        return action$.pipe(
          filterActions(appBarActions.RefreshData),
          concatMap(() =>
            getRefsToRefresh().map(({ ref, stateKey }) =>
              refreshRefsActions.Refresh({ ref, stateKey, path: 'root' })
            )
          )
        );
      },
      (store: Store<RouterSlice & InsightsSlice>) => ({
        getRefsToRefresh: (): RefToRefresh[] => {
          const refsToRefresh: RefToRefresh[] = [];

          const scopeTargetRef = store.select(activeTargetSelector).get();
          if (scopeTargetRef) {
            refsToRefresh.push({
              ref: scopeTargetRef,
              stateKey: 'context-target',
            });
          }
          const scopeEventRef = store.select(activeEventSelector).get();
          if (scopeEventRef) {
            refsToRefresh.push({
              ref: scopeEventRef,
              stateKey: 'context-event',
            });
          }
          const relatedTargetRefs = store
            .select(activeRelatedTargetsSelector)
            .get();
          if (relatedTargetRefs) {
            refsToRefresh.push(
              ...relatedTargetRefs.map((ref) => ({
                ref,
                stateKey: `target-${ref.id}`,
              }))
            );
          }

          return refsToRefresh;
        },
      })
    )
  );

interface RefToRefresh {
  ref: Ref;
  stateKey: string;
}
