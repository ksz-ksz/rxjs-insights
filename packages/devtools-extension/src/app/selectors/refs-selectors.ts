import { createSelector } from '@lib/store';
import { RefsSlice, RefsState, RefState, RefUiState } from '@app/store/refs';

export const refsSelector = createSelector((state: RefsSlice) => state.refs);

const defaultRefState: RefState = { expandedObjects: {} };

export function getRefState(refs: RefsState, stateKey: string) {
  return refs.states[stateKey] ?? defaultRefState;
}

const defaultRefUiState: RefUiState = { expandedPaths: new Set() };

export function getRefUiState(refs: RefsState, stateKey: string) {
  const uiState = refs.uiStates[stateKey];

  return uiState ?? defaultRefUiState;
}
