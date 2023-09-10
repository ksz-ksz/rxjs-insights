import { createSelector } from '@lib/store';
import { old_router } from '@app/old_router';

export const timeSelector = createSelector(
  [old_router.selectors.url],
  ([url]) =>
    url.queryParams.time !== undefined ? Number(url.queryParams.time) : 0
);
