import { Slice } from '@lib/store';
import { PropertyRef } from '@app/protocols/refs';
import { refOutletActions } from '@app/actions/ref-outlet-actions';
import { refsActions } from '@app/actions/refs-actions';
import { refreshRefsActions } from '@app/actions/refresh-refs-actions';
import { inspectedWindowActions } from '@app/actions/inspected-window-actions';
import { createStore, tx } from '@lib/state-fx/store';

export interface RefState {
  expandedObjects: Record<number, PropertyRef[]>;
}

export interface RefUiState {
  expandedPaths: Set<string>;
}

export interface RefsState {
  states: Record<string, RefState>;
  uiStates: Record<string, RefUiState>;
}

export type RefsSlice = Slice<'refs', RefsState>;

const initialState: RefsState = {
  states: {},
  uiStates: {},
};

export const refsStore = createStore({
  namespace: 'refs',
  state: initialState,
})({
  reload: tx(
    [inspectedWindowActions.InspectedWindowReloaded],
    () => initialState
  ),
  expand: tx([refOutletActions.Expand], (state, action) => {
    const { stateKey, path } = action.payload;
    if (!state.uiStates[stateKey]) {
      state.uiStates[stateKey] = {
        expandedPaths: new Set(),
      };
    }
    state.uiStates[stateKey].expandedPaths.add(path);
  }),
  collapse: tx([refOutletActions.Collapse], (state, action) => {
    const { stateKey, path } = action.payload;
    if (!state.uiStates[stateKey]) {
      state.uiStates[stateKey] = {
        expandedPaths: new Set(),
      };
    }
    state.uiStates[stateKey].expandedPaths.delete(path);
  }),
  refsForExpandedPathsLoaded: tx(
    [refsActions.RefsForExpandedPathsLoaded],
    (state, action) => {
      const { stateKey, refs } = action.payload;
      if (!state.states[stateKey]) {
        state.states[stateKey] = {
          expandedObjects: {},
        };
      }
      for (let refsKey in refs) {
        if (!state.states[stateKey].expandedObjects[refsKey]) {
          state.states[stateKey].expandedObjects[refsKey] = refs[refsKey];
        }
      }
    }
  ),
  refForInvokedGetterLoaded: tx(
    [refsActions.RefForInvokedGetterLoaded],
    (state, action) => {
      const { stateKey, objectId, keyId, ref } = action.payload;
      if (!state.states[stateKey]) {
        state.states[stateKey] = {
          expandedObjects: {},
        };
      }
      const props = state.states[stateKey].expandedObjects[objectId];
      for (let prop of props) {
        if (prop.keyId === keyId) {
          prop.val = ref;
          break;
        }
      }
    }
  ),
  refresh: tx([refreshRefsActions.Refresh], (state, action) => {
    const { stateKey } = action.payload;
    state.states[stateKey] = {
      expandedObjects: {},
    };
  }),
});
