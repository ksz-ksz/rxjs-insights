import { createSelector } from '@lib/store';
import { router } from '@app/router';

export const timeSelector = createSelector([router.selectors.url], ([url]) =>
  url.queryParams.time !== undefined ? Number(url.queryParams.time) : 0
);
