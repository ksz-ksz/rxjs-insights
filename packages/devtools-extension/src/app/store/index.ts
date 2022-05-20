import { createStore, createStoreHooks } from '@lib/store';
import {
  routerReaction,
  routerReducer,
  routerTransitionsReaction,
} from '@app/store/router';
import { statusReactions, statusReducer } from '@app/store/status';
import { inspectedWindowReaction } from '@app/store/inspected-window';
import { statisticsReaction, statisticsReducer } from '@app/store/statisctics';
import { targetReaction, targetsReducer } from '@app/store/targets';

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
  .addReaction(targetReaction);

export const { useStore, useDispatch, useSelector } =
  createStoreHooks<typeof store>();
