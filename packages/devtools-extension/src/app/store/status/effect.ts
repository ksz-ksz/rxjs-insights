import {
  catchError,
  first,
  from,
  map,
  merge,
  of,
  race,
  startWith,
  switchMap,
  timer,
} from 'rxjs';
import { statusActions } from '@app/actions/status-actions';
import { inspectedWindowActions } from '@app/actions/inspected-window-actions';
import { instrumentationStatusPageActions } from '@app/actions/instrumentation-status-page-actions';
import { instrumentationClient } from '@app/clients/instrumentation';
import { createEffectComponent } from '@lib/state-fx/store';

export const statusEffect = createEffectComponent(() => ({
  name: 'status',
  effects: {
    handleInstrumentationStatusUpdate() {
      return from(instrumentationClient.getStatus()).pipe(
        map((instrumentationStatus) =>
          statusActions.InstrumentationStatusResolved({
            instrumentationStatus,
          })
        ),
        catchError(() =>
          of(
            statusActions.InstrumentationStatusResolved({
              instrumentationStatus: 'not-connected',
            })
          )
        )
      );
    },
    handleRefresh(actions) {
      return merge(
        actions.ofType(
          instrumentationStatusPageActions.WaitForInstrumentationButtonClicked
        ),
        actions.ofType(inspectedWindowActions.InspectedWindowReloaded)
      ).pipe(
        switchMap(() =>
          race([
            timer(1000, 100).pipe(
              switchMap(() => from(instrumentationClient.getStatus())),
              first(
                (instrumentationStatus) =>
                  instrumentationStatus !== 'not-installed'
              ),
              map((instrumentationStatus) =>
                statusActions.InstrumentationStatusResolved({
                  instrumentationStatus,
                })
              ),
              catchError(() =>
                of(
                  statusActions.InstrumentationStatusResolved({
                    instrumentationStatus: 'not-connected',
                  })
                )
              )
            ),
            timer(4000).pipe(
              map(() =>
                statusActions.InstrumentationStatusResolved({
                  instrumentationStatus: 'not-installed',
                })
              )
            ),
          ]).pipe(
            startWith(
              statusActions.InstrumentationStatusResolved({
                instrumentationStatus: undefined,
              })
            )
          )
        )
      );
    },
  },
}));
