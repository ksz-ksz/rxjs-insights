import { selectRoute } from '@app/router';
import { targetRoute } from '@app/routes';
import { createSuperSelector } from '../../lib/state-fx/store/super-selector';

// TODO: impl changed
export const selectTime = createSuperSelector([selectRoute], (ctx) => {
  const route = selectRoute(ctx, targetRoute);
  return route?.search?.time ?? 0;
});
