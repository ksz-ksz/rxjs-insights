import { concatMap, distinctUntilChanged, EMPTY, of } from 'rxjs';
import {
  activeTargetSelector,
  activeTargetState,
  activeTargetStateSelector,
} from '@app/selectors/active-target-state-selector';
import { refreshRefsActions } from '@app/actions/refresh-refs-actions';
import { appBarActions } from '@app/actions/app-bar-actions';
import { Ref } from '@app/protocols/refs';
import { timeSelector } from '@app/selectors/time-selectors';
import {
  createEffect,
  createSelector,
  createSelectorFunction,
  select,
  SelectorContextFromDeps,
} from '@lib/state-fx/store';

const activeEventSelector = createSelector(
  (
    context: SelectorContextFromDeps<
      [typeof activeTargetStateSelector, typeof timeSelector]
    >
  ) => {
    const activeTargetState = activeTargetStateSelector(context);
    const time = timeSelector(context);
    if (activeTargetState) {
      const { relations } = activeTargetState;
      return relations.events[time];
    }
  }
);

const activeRelatedTargetsSelector = createSelector(
  (context: SelectorContextFromDeps<[typeof activeTargetStateSelector]>) => {
    const activeTargetState = activeTargetStateSelector(context);
    if (activeTargetState) {
      const { relations } = activeTargetState;
      return Object.values(relations.targets);
    }
  }
);

export const refreshRefsEffect = createEffect({
  namespace: 'refreshRefs',
  deps: [activeTargetState],
})({
  handleActiveTargetChange(actions, [activeTargets]) {
    return activeTargets.getStateObservable().pipe(
      select(activeTargetSelector),
      distinctUntilChanged(),
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
    );
  },
  handleActiveEventChange(actions, [activeTargets]) {
    return activeTargets.getStateObservable().pipe(
      select(activeEventSelector),
      distinctUntilChanged(),
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
    );
  },
  handleRefreshData(actions, [activeTargets]) {
    const getActiveTarget = createSelectorFunction(activeTargetSelector);
    const getActiveEvent = createSelectorFunction(activeEventSelector);
    const getActiveRelatedTargets = createSelectorFunction(
      activeRelatedTargetsSelector
    );
    function getRefsToRefresh(): RefToRefresh[] {
      const refsToRefresh: RefToRefresh[] = [];

      const scopeTargetRef = getActiveTarget(activeTargets.getState());
      if (scopeTargetRef) {
        refsToRefresh.push({
          ref: scopeTargetRef,
          stateKey: 'context-target',
        });
      }
      const scopeEventRef = getActiveEvent(activeTargets.getState());
      if (scopeEventRef) {
        refsToRefresh.push({
          ref: scopeEventRef,
          stateKey: 'context-event',
        });
      }
      const relatedTargetRefs = getActiveRelatedTargets(
        activeTargets.getState()
      );
      if (relatedTargetRefs) {
        refsToRefresh.push(
          ...relatedTargetRefs.map((ref) => ({
            ref,
            stateKey: `target-${ref.id}`,
          }))
        );
      }

      return refsToRefresh;
    }

    return actions
      .ofType(appBarActions.RefreshData)
      .pipe(
        concatMap(() =>
          getRefsToRefresh().map(({ ref, stateKey }) =>
            refreshRefsActions.Refresh({ ref, stateKey, path: 'root' })
          )
        )
      );
  },
});

interface RefToRefresh {
  ref: Ref;
  stateKey: string;
}
