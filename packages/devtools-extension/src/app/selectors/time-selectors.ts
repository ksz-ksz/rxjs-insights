import { createSelector, SelectorContextFromDeps } from '@lib/state-fx/store';
import { selectRoute } from '@app/router';
import { targetRoute } from '@app/routes';

// TODO: impl changed
export const timeSelector = createSelector(
  (context: SelectorContextFromDeps<[typeof selectRoute]>) => {
    const route = selectRoute(context, targetRoute);
    return route?.search?.time ?? 0;
  }
);
