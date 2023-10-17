import { insightsSelector } from '@app/selectors/insights-selectors';
import {
  createSelector,
  SelectorContext,
  SelectorContextFromDeps,
  StoreState,
} from '@lib/state-fx/store';
import { routerStore, selectRoute } from '@app/router';
import { targetRoute } from '@app/routes';
import { insightsStore } from '@app/store/insights/store';

export const activeTargetStateSelector = createSelector(
  (
    context: SelectorContextFromDeps<
      [typeof selectRoute, typeof insightsSelector]
    >
  ) => {
    const targetId = selectRoute(context, targetRoute)?.params?.targetId;
    return targetId !== undefined
      ? insightsSelector(context).targets[targetId]
      : undefined;
  }
);

export const activeTargetSelector = createSelector(
  (context: SelectorContextFromDeps<[typeof activeTargetStateSelector]>) => {
    const activeTargetState = activeTargetStateSelector(context);
    if (activeTargetState) {
      const { target } = activeTargetState;
      return target;
    } else {
      return undefined;
    }
  }
);

export const activeTargetUiStateSelector = createSelector(
  (
    context: SelectorContextFromDeps<
      [typeof selectRoute, typeof insightsSelector]
    >
  ) => {
    const targetId = selectRoute(context, targetRoute)?.params?.targetId;
    return targetId !== undefined
      ? insightsSelector(context).targetsUi[targetId]
      : undefined;
  }
);
