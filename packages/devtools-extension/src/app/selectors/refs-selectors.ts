import { createSelector } from '@lib/store';
import { RefsSlice, RefsState, RefState, RefUiState } from '@app/store/refs';

export const refsSelector = createSelector((state: RefsSlice) => state.refs);

const defaultRefState: RefState = { expandedObjects: {} };

export function getRefState(refs: RefsState, stateKey: string) {
  return refs.states[stateKey] ?? defaultRefState;
}

export function refStateSelector(stateKey: string) {
  return createSelector([refsSelector], ([refs]) => {
    return getRefState(refs, stateKey);
  });
}

const defaultRefUiState: RefUiState = { expandedPaths: new Set() };

export function getRefsUiState(refs: RefsState, stateKey: string) {
  const uiState = refs.uiStates[stateKey];

  return uiState ?? defaultRefUiState;
}

export function refUiStateSelector(stateKey: string) {
  return createSelector([refsSelector], ([refs]) => {
    return getRefsUiState(refs, stateKey);
  });
}
