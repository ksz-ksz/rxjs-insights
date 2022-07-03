import {
  combineReactions,
  createReaction,
  filterActions,
  Store,
} from '@lib/store';
import { activeTargetActions } from '@app/actions/active-target-actions';
import { concatMap, EMPTY, of } from 'rxjs';
import { refOutletActions } from '@app/actions/ref-outlet-actions';
import { refUiStateSelector } from '@app/selectors/refs-selectors';
import { RefsSlice } from '@app/store/refs';
import { subscribersGraphActions } from '@app/actions/subscribers-graph-actions';
import { eventsLogActions } from '@app/actions/events-log-actions';
import { insightsActions } from '@app/actions/insights-actions';

export const targetRefsReaction = combineReactions()
  .add(
    createReaction(
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
          return store
            .get(refUiStateSelector(stateKey))
            .expandedPaths.has('root');
        },
      })
    )
  )
  .add(
    createReaction(
      (action$, { isExpanded }) =>
        action$.pipe(
          filterActions([
            eventsLogActions.EventSelected,
            insightsActions.PlayNextEvent,
          ]),
          concatMap((action) => {
            const { event } = action.payload;
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
      (store: Store<RefsSlice>) => ({
        isExpanded(stateKey: string) {
          return store
            .get(refUiStateSelector(stateKey))
            .expandedPaths.has('root');
        },
      })
    )
  );
