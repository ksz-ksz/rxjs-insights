import { concatMap, distinctUntilChanged, EMPTY, map, of } from 'rxjs';
import {
  selectActiveTarget,
  selectActiveTargetState,
} from '@app/selectors/active-target-state-selector';
import { refreshRefsActions } from '@app/actions/refresh-refs-actions';
import { appBarActions } from '@app/actions/app-bar-actions';
import { Ref } from '@app/protocols/refs';
import { selectTime } from '@app/selectors/time-selectors';
import { createEffect } from '@lib/state-fx/store';
import { createSuperSelector } from '../../../lib/state-fx/store/super-selector';
import { createSelection } from '../../../lib/state-fx/store/selection';

const selectActiveEvent = createSuperSelector(
  [selectActiveTargetState, selectTime],
  (context) => {
    const activeTargetState = selectActiveTargetState(context);
    const time = selectTime(context);
    if (activeTargetState) {
      const { relations } = activeTargetState;
      return relations.events[time];
    }
  }
);

const selectActiveRelatedTargets = createSuperSelector(
  [selectActiveTargetState],
  (context) => {
    const activeTargetState = selectActiveTargetState(context);
    if (activeTargetState) {
      const { relations } = activeTargetState;
      return Object.values(relations.targets);
    }
  }
);

export const refreshRefsEffect = createEffect({
  namespace: 'refreshRefs',
  deps: {
    activeTarget: createSelection(selectActiveTarget),
    activeEvent: createSelection(selectActiveEvent),
    activeRelatedTargets: createSelection(selectActiveRelatedTargets),
  },
})({
  handleActiveTargetChange(actions, { activeTarget }) {
    return activeTarget.pipe(
      map(() => activeTarget.getResult()),
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
  handleActiveEventChange(actions, { activeTarget }) {
    return activeTarget.pipe(
      map(() => activeTarget.getResult()),
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
  handleRefreshData(
    actions,
    { activeTarget, activeEvent, activeRelatedTargets }
  ) {
    function getRefsToRefresh(): RefToRefresh[] {
      const refsToRefresh: RefToRefresh[] = [];

      const scopeTargetRef = activeTarget.getResult();
      if (scopeTargetRef) {
        refsToRefresh.push({
          ref: scopeTargetRef,
          stateKey: 'context-target',
        });
      }
      const scopeEventRef = activeEvent.getResult();
      if (scopeEventRef) {
        refsToRefresh.push({
          ref: scopeEventRef,
          stateKey: 'context-event',
        });
      }
      const relatedTargetRefs = activeRelatedTargets.getResult();
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
