import { map, merge } from 'rxjs';
import { eventsLogActions } from '@app/actions/events-log-actions';
import { refOutletContextActions } from '@app/actions/ref-outlet-context-actions';
import { insightsActions } from '@app/actions/insights-actions';
import { createEffectComponent } from '@lib/state-fx/store';
import {
  routerComponent,
  routerActions,
  routerStoreComponent,
} from '@app/router';
import { Encoder } from '@lib/state-fx/store-router';

function updateDecoded<TEncoded, TDecoded>(
  encoder: Encoder<TEncoded, TDecoded>,
  input: TEncoded,
  updater: (value: TDecoded) => TDecoded
): TEncoded | undefined {
  const decodeResult = encoder.decode(input);
  if (decodeResult.valid) {
    const encodeResult = encoder.encode(updater(decodeResult.value));
    if (encodeResult.valid) {
      return encodeResult.value;
    }
  }

  return undefined;
}

export const timeEffect = createEffectComponent(
  ({ router, routerStore }) => ({
    name: 'time',
    effects: {
      syncTimeInUrl(actions) {
        return merge(
          actions.ofType(eventsLogActions.EventSelected),
          actions.ofType(refOutletContextActions.FocusEvent),
          actions.ofType(insightsActions.PlayNextEvent)
        ).pipe(
          map((action) => {
            const routerState = routerStore.getState();

            return routerActions.navigate({
              historyMode: 'replace',
              location: {
                ...routerState.location,
                search:
                  updateDecoded(
                    router.searchEncoder,
                    routerState.location.search,
                    (params) =>
                      params.set(['time', String(action.payload.event.time)])
                  ) ?? '',
              },
              state: routerState.state,
            });
          })
        );
      },
    },
  }),
  {
    router: routerComponent,
    routerStore: routerStoreComponent,
  }
);
