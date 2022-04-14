import {
  createReaction,
  createStore,
  createStoreHooks,
  Store,
} from '@lib/store';
import {
  statusActions,
  statusReactions,
  statusReducer,
  StatusSlice,
} from '@app/store/status';
import { of } from 'rxjs';

export const statusReaction = createReaction(
  () => of(statusActions.SetStatus({ status: 'connected' })),
  (store: Store<StatusSlice>) => store
);

export const store = createStore()
  .addReducer(statusReducer)
  .addReaction(statusReactions)

export const { useStore, useDispatch, useSelector } =
  createStoreHooks<typeof store>();
