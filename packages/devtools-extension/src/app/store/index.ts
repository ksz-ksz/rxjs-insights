import { createStore, createStoreHooks } from '@lib/store';
import {
  routerReaction,
  routerReducer,
  routerTransitionsReaction,
} from '@app/store/router';
import { statusReactions, statusReducer } from '@app/store/status';
import { inspectedWindowReaction } from '@app/store/inspected-window';
import { statisticsReaction, statisticsReducer } from '@app/store/statisctics';
import { targetReaction } from '@app/store/targets/reaction';
import { targetsReducer } from '@app/store/targets/slice';
import { insightsReaction, insightsReducer } from '@app/store/insights';

export const store = createStore()
  .addReducer(statusReducer)
  .addReaction(statusReactions)
  .addReducer(statisticsReducer)
  .addReaction(statisticsReaction)
  .addReducer(routerReducer)
  .addReaction(routerReaction)
  .addReaction(routerTransitionsReaction)
  .addReaction(inspectedWindowReaction)
  .addReducer(targetsReducer)
  .addReaction(targetReaction)
  .addReducer(insightsReducer)
  .addReaction(insightsReaction);

export const { useStore, useDispatch, useSelector } =
  createStoreHooks<typeof store>();
