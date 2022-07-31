import { combineReactions, createReaction, filterActions } from '@lib/store';
import {
  catchError,
  first,
  from,
  map,
  of,
  race,
  startWith,
  switchMap,
  timer,
} from 'rxjs';
import { statusActions } from '@app/actions/status-actions';
import { inspectedWindowActions } from '@app/actions/inspected-window-actions';
import { tapAsync } from '@lib/operators';
import { instrumentationStatusPageActions } from '@app/actions/instrumentation-status-page-actions';
import { instrumentationClient } from '@app/clients/instrumentation';

export const statusReactions = combineReactions()
  .add(
    createReaction(() =>
      from(instrumentationClient.getStatus()).pipe(
        map((instrumentationStatus) =>
          statusActions.InstrumentationStatusResolved({ instrumentationStatus })
        ),
        catchError(() =>
          of(
            statusActions.InstrumentationStatusResolved({
              instrumentationStatus: 'not-connected',
            })
          )
        )
      )
    )
  )
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions([
          instrumentationStatusPageActions.WaitForInstrumentationButtonClicked,
          inspectedWindowActions.InspectedWindowReloaded,
        ]),
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
      )
    )
  )
  .add(
    createReaction((action$) =>
      action$.pipe(
        filterActions(instrumentationStatusPageActions.ReloadPageButtonClicked),
        tapAsync(async () => {
          await instrumentationClient.install();
        })
      )
    )
  );
