import { combineReactions, createReaction, filterActions } from '@lib/store';
import { refOutletActions } from '@app/actions/ref-outlet-actions';
import { filter, from, map, switchMap } from 'rxjs';
import { refsClient } from '@app/clients/refs';
import { refsActions } from '@app/actions/refs-actions';

export const refsReaction = combineReactions()
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions(refOutletActions.Expand),
        switchMap((action) =>
          from(refsClient.expand(action.payload.refId)).pipe(
            filter(Boolean),
            map((props) =>
              refsActions.PropsLoaded({
                refId: action.payload.refId,
                props,
              })
            )
          )
        )
      )
    )
  )
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions(refOutletActions.InvokeGetter),
        switchMap((action) =>
          from(refsClient.invokeGetter(action.payload.refId)).pipe(
            filter(Boolean),
            map((ref) =>
              refsActions.RefLoaded({
                refId: action.payload.refId,
                ref,
              })
            )
          )
        )
      )
    )
  );
