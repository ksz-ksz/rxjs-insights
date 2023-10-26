import { RefsState, RefState, RefUiState } from '@app/store/refs/store';
import { refsStore } from '@app/store/refs/store';
import { createStoreSuperSelector } from '../../lib/state-fx/store/super-selector';

export const selectRefsState = createStoreSuperSelector(refsStore);

const defaultRefState: RefState = { expandedObjects: {} };

export function getRefState(refs: RefsState, stateKey: string) {
  return refs.states[stateKey] ?? defaultRefState;
}

const defaultRefUiState: RefUiState = { expandedPaths: new Set() };

export function getRefUiState(refs: RefsState, stateKey: string) {
  const uiState = refs.uiStates[stateKey];

  return uiState ?? defaultRefUiState;
}
