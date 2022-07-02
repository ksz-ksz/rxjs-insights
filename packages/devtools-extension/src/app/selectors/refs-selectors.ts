import { createSelector } from '@lib/store';
import { RefsSlice } from '@app/store/refs';

const refsSelector = createSelector((state: RefsSlice) => state.refs);

export function refStateSelector(stateKey: string) {
  return createSelector([refsSelector], ([refs]) => {
    return refs.states[stateKey] ?? { expandedObjects: {} };
  });
}

export function refUiStateSelector(stateKey: string) {
  return createSelector([refsSelector], ([refs]) => {
    const uiState = refs.uiStates[stateKey];

    return uiState ?? { expandedPaths: new Set() };
  });
}
