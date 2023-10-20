import { statusActions } from '@app/actions/status-actions';
import { map } from 'rxjs';
import { createEffect } from '@lib/state-fx/store';
import { dashboardRoute, statusRoute } from '@app/routes';
import { routerActions } from '@app/router';

export const navigationEffect = createEffect({
  namespace: 'navigation',
})({
  handleInstrumentationStatus(actions) {
    return actions.ofType(statusActions.InstrumentationStatusResolved).pipe(
      map((action) =>
        routerActions.Navigate({
          location:
            action.payload.instrumentationStatus !== 'installed'
              ? statusRoute()
              : dashboardRoute(),
        })
      )
    );
  },
});
