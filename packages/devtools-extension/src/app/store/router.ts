import { createReaction, filterActions, Slice } from '@lib/store';
import { createRouterSlice, createUrl, RouterState } from '@lib/store-router';
import { map } from 'rxjs';
import { statusActions } from '@app/actions/status-actions';
import { router } from '@app/router';

export const routerTransitionsReaction = createReaction((action$) =>
  action$.pipe(
    filterActions(statusActions.InstrumentationStatusResolved),
    map((action) =>
      router.actions.Navigate({
        url:
          action.payload.instrumentationStatus !== 'installed'
            ? createUrl(['status'])
            : createUrl(['dashboard']),
      })
    )
  )
);

export const { routerReducer, routerReaction } = createRouterSlice(router);

export type RouterSlice = Slice<'router', RouterState<void>>;
