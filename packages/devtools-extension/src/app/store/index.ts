import { createStore, createStoreHooks } from '@lib/store';
import { statusReactions, statusReducer } from '@app/store/status';
import {
  routerReaction,
  routerReducer,
  routerTransitionsReaction,
} from '@app/store/router';

export const store = createStore()
  .addReducer(statusReducer)
  .addReaction(statusReactions)
  .addReducer(routerReducer)
  .addReaction(routerReaction)
  .addReaction(routerTransitionsReaction);

export const { useStore, useDispatch, useSelector } =
  createStoreHooks<typeof store>();
