import { createReaction, filterActions, Store } from '@lib/store';
import { activeTargetActions } from '@app/actions/active-target-actions';
import { concatMap, EMPTY, of } from 'rxjs';
import { refOutletActions } from '@app/actions/ref-outlet-actions';
import { refUiStateSelector } from '@app/selectors/refs-selectors';
import { RefsSlice } from '@app/store/refs';

export const targetRefsReaction = createReaction(
  (action$, { isExpanded }) =>
    action$.pipe(
      filterActions(activeTargetActions.ActiveTargetChanged),
      concatMap((action) => {
        const { target } = action.payload;
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
  (store: Store<RefsSlice>) => ({
    isExpanded(stateKey: string) {
      return store.get(refUiStateSelector(stateKey)).expandedPaths.has('root');
    },
  })
);
