import { combineReactions, createReaction, filterActions } from '@lib/store';
import { first, from, map, race, startWith, switchMap, timer } from 'rxjs';
import { statusActions } from '@app/store/status/actions';
import { inspectedWindowActions } from '@app/store/inspected-window';
import { tapAsync } from '@lib/operators';
import { createClient, createInspectedWindowEvalClientAdapter } from '@lib/rpc';
import {
  Instrumentation,
  InstrumentationChannel,
} from '@app/protocols/instrumentation-status';
import { instrumentationStatusPageActions } from '@app/store/instrumentation-status-page';

const targetClient = createClient<Instrumentation>(
  createInspectedWindowEvalClientAdapter(InstrumentationChannel)
);
export const statusReactions = combineReactions()
  .add(
    createReaction(() =>
      from(targetClient.getStatus()).pipe(
        map((instrumentationStatus) =>
          statusActions.InstrumentationStatusResolved({ instrumentationStatus })
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
              switchMap(() => from(targetClient.getStatus())),
              first(
                (instrumentationStatus) =>
                  instrumentationStatus !== 'not-available'
              ),
              map((instrumentationStatus) =>
                statusActions.InstrumentationStatusResolved({
                  instrumentationStatus,
                })
              )
            ),
            timer(4000).pipe(
              map(() =>
                statusActions.InstrumentationStatusResolved({
                  instrumentationStatus: 'not-available',
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
          await targetClient.install();
        })
      )
    )
  );