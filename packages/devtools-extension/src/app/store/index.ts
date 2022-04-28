import { createStore, createStoreHooks } from '@lib/store';
import { statusReactions, statusReducer } from '@app/store/status';

export const store = createStore()
  .addReducer(statusReducer)
  .addReaction(statusReactions);

export const { useStore, useDispatch, useSelector } =
  createStoreHooks<typeof store>();
