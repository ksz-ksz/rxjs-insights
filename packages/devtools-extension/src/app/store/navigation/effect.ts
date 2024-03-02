import { statusActions } from '@app/actions/status-actions';
import { map } from 'rxjs';
import { createEffectComponent } from '@lib/state-fx/store';
import { dashboardRoute, statusRoute } from '@app/routes';
import { routerActions } from '@app/router';

export const navigationEffect = createEffectComponent(() => ({
  name: 'navigation',
  effects: {
    handleInstrumentationStatus(actions) {
      return actions.ofType(statusActions.InstrumentationStatusResolved).pipe(
        map((action) =>
          routerActions.navigate({
            location:
              action.payload.instrumentationStatus !== 'installed'
                ? statusRoute()
                : dashboardRoute(),
          })
        )
      );
    },
  },
}));
