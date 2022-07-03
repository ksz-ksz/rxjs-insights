import { createSelector } from '@lib/store';
import { RefsSlice, RefState, RefUiState } from '@app/store/refs';

const refsSelector = createSelector((state: RefsSlice) => state.refs);

const defaultRefState: RefState = { expandedObjects: {} };

export function refStateSelector(stateKey: string) {
  return createSelector([refsSelector], ([refs]) => {
    return refs.states[stateKey] ?? defaultRefState;
  });
}

const defaultRefUiState: RefUiState = { expandedPaths: new Set() };

export function refUiStateSelector(stateKey: string) {
  return createSelector([refsSelector], ([refs]) => {
    const uiState = refs.uiStates[stateKey];

    return uiState ?? defaultRefUiState;
  });
}
