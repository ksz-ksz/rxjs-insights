import { combineReactions, createReaction, filterActions } from '@lib/store';
import { refOutletActions } from '@app/actions/ref-outlet-actions';
import { from, map, switchMap } from 'rxjs';
import { refsClient } from '@app/clients/refs';
import { refsActions } from '@app/actions/refs-actions';

export const refsReaction = combineReactions().add(
  createReaction((action$) =>
    action$.pipe(
      filterActions(refOutletActions.Expand),
      switchMap((action) =>
        from(refsClient.expand(action.payload.refId)).pipe(
          map((children) =>
            refsActions.RefChildrenLoaded({
              refId: action.payload.refId,
              children: children!,
            })
          )
        )
      )
    )
  )
);
