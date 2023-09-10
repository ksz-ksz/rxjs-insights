import { createReaction, filterActions, Slice } from '@lib/store';
import { createRouterSlice, createUrl, RouterState } from '@lib/store-router';
import { map } from 'rxjs';
import { statusActions } from '@app/actions/status-actions';
import { old_router } from '@app/old_router';

export const routerTransitionsReaction = createReaction((action$) =>
  action$.pipe(
    filterActions(statusActions.InstrumentationStatusResolved),
    map((action) =>
      old_router.actions.Navigate({
        url:
          action.payload.instrumentationStatus !== 'installed'
            ? createUrl(['status'])
            : createUrl(['dashboard']),
      })
    )
  )
);

export const { routerReducer, routerReaction } = createRouterSlice(old_router);

export type OldRouterSlice = Slice<'router', RouterState<void>>;
