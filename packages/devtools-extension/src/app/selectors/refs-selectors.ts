import { createSelector, createSliceSelector } from '@lib/store';
import { RefsState } from '@app/store/refs';

const refsState = createSliceSelector<'refs', RefsState>('refs');

export function getRefState(refId: number) {
  return createSelector({ state: refsState }, ({ state }) => {
    return (
      state.refs[refId] ?? {
        expanded: false,
      }
    );
  });
}
