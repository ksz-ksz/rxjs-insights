import { createSelector } from '@lib/store';
import { StatusSlice } from '@app/store/status';

export const statusSelector = createSelector(
  (state: StatusSlice) => state.status
);
