import { createSelector, createSliceSelector } from '@lib/store';
import { RefsState } from '@app/store/refs';

const refsState = createSliceSelector<'refs', RefsState>('refs');

export function refState(refId: number) {
  return createSelector({ state: refsState }, ({ state }) => {
    console.log({ state, refId });
    return state.refs[refId];
  });
}
