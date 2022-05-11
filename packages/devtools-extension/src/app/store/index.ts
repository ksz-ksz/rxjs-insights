import { createStore, createStoreHooks } from '@lib/store';
import {
  routerReaction,
  routerReducer,
  routerTransitionsReaction,
} from '@app/store/router';
import { statusReducer } from '@app/store/status/reducer';
import { statusReactions } from '@app/store/status/reaction';
import { inspectedWindowReaction } from '@app/store/inspected-window';

export const store = createStore()
  .addReducer(statusReducer)
  .addReaction(statusReactions)
  .addReducer(routerReducer)
  .addReaction(routerReaction)
  .addReaction(routerTransitionsReaction)
  .addReaction(inspectedWindowReaction);

export const { useStore, useDispatch, useSelector } =
  createStoreHooks<typeof store>();
