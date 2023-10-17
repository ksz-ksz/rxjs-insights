import {
  combineReactions,
  createReaction,
  old_createSelector,
  filterActions,
  Store,
} from '@lib/store';
import { concatMap, distinctUntilChanged, EMPTY, of } from 'rxjs';
import { activeTargetStateSelector } from '@app/selectors/active-target-state-selector';
import { OldRouterSlice } from '@app/store/old_router';
import { insightsStore, InsightsSlice } from '@app/store/insights/store';
import { refreshRefsActions } from '@app/actions/refresh-refs-actions';
import { appBarActions } from '@app/actions/app-bar-actions';
import { Ref } from '@app/protocols/refs';
import { timeSelector } from '@app/selectors/time-selectors';
import {
  createEffect,
  createSelector,
  SelectorContextFromDeps,
} from '@lib/state-fx/store';
import { routerStore } from '@app/router';

const activeEventSelector = createSelector(
  (
    context: SelectorContextFromDeps<
      [typeof activeTargetStateSelector, typeof timeSelector]
    >
  ) => {
    const activeTargetState = activeTargetStateSelector(context);
    const time = timeSelector(context);
    if (activeTargetState) {
      const { relations } = activeTargetState!;
      return relations.events[time];
    }
  }
);

const activeRelatedTargetsSelector = old_createSelector(
  [activeTargetStateSelector],
  ([activeTargetState]) => {
    if (activeTargetState) {
      const { relations } = activeTargetState!;
      return Object.values(relations.targets);
    }
  }
);

export const refreshRefsEffect = createEffect({
  namespace: 'refreshRefs',
  deps: [routerStore, insightsStore],
})({
  handleActiveTargetChange(actions, deps) {
    return;
  },
});

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
      (store: Store<OldRouterSlice & InsightsSlice>) => ({
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
      (store: Store<OldRouterSlice & InsightsSlice>) => ({
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
      (store: Store<OldRouterSlice & InsightsSlice>) => ({
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
