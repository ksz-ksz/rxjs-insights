import { createSelector } from '@lib/store';
import { RefsSlice } from '@app/store/refs';

const refsSelector = createSelector((state: RefsSlice) => state.refs);

export function refStateSelector(refId: number) {
  return createSelector([refsSelector], ([refs]) => {
    return refs.refs[refId] ?? {};
  });
}
