import { createSliceSelector } from '@lib/store';
import { StatusState } from '@app/store/status';

export const statusSelector = createSliceSelector<'status', StatusState>(
  'status'
);
