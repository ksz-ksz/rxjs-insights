import { old_createSelector } from '@lib/store';
import { StatusSlice } from '@app/store/status';

export const statusSelector = old_createSelector(
  (state: StatusSlice) => state.status
);
