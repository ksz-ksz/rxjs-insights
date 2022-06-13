import {
  combineReactions,
  createReaction,
  filterActions,
  Store,
} from '@lib/store';
import { refOutletActions } from '@app/actions/ref-outlet-actions';
import { EMPTY, filter, from, map, switchMap } from 'rxjs';
import { refsClient } from '@app/clients/refs';
import { refsActions } from '@app/actions/refs-actions';
import { RefsSlice } from '@app/store/refs/slice';
import { refStateSelector } from '@app/selectors/refs-selectors';

export const refsReaction = combineReactions()
  .add(
    createReaction(
      (action$, store) =>
        action$.pipe(
          filterActions(refOutletActions.Expand),
          switchMap((action) => {
            const { props } = store.get(refStateSelector(action.payload.refId));
            return props !== undefined
              ? EMPTY
              : from(refsClient.expand(action.payload.refId)).pipe(
                  filter(Boolean),
                  map((props) =>
                    refsActions.PropsLoaded({
                      refId: action.payload.refId,
                      props,
                    })
                  )
                );
          })
        ),
      (store: Store<RefsSlice>) => store
    )
  )
  .add(
    createReaction(
      (action$, store) =>
        action$.pipe(
          filterActions(refOutletActions.InvokeGetter),
          switchMap((action) => {
            const { ref } = store.get(refStateSelector(action.payload.refId));
            return ref !== undefined
              ? EMPTY
              : from(refsClient.invokeGetter(action.payload.refId)).pipe(
                  filter(Boolean),
                  map((ref) =>
                    refsActions.RefLoaded({
                      refId: action.payload.refId,
                      ref,
                    })
                  )
                );
          })
        ),
      (store: Store<RefsSlice>) => store
    )
  );
