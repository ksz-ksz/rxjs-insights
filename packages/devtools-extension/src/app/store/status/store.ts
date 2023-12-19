import { InstrumentationStatus } from '@app/protocols/instrumentation-status';
import { statusActions } from '@app/actions/status-actions';
import { typeOf } from '@lib/state-fx/store';
import {
  createStoreComponent,
  StoreDef,
  tx,
} from '../../../lib/state-fx/store/store';

export interface StatusState {
  instrumentationStatus: InstrumentationStatus | 'not-connected' | undefined;
}

export const statusStore = createStoreComponent(
  (): StoreDef<StatusState> => ({
    name: 'status',
    state: typeOf<StatusState>({ instrumentationStatus: undefined }),
    transitions: {
      set: tx(
        [statusActions.InstrumentationStatusResolved],
        (state, action) => {
          state.instrumentationStatus = action.payload.instrumentationStatus;
        }
      ),
    },
  })
);
