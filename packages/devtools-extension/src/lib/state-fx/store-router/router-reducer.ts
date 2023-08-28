import { Actions, createReducer, Reducer, typeOf } from '../store';
import { HistoryEntry, HistoryEntryOrigin } from './history';
import { ActiveRoute } from './active-route';

export interface RouterState {
  currentEntry?: HistoryEntry;
  currentEntryOrigin?: HistoryEntryOrigin;
  routes?: ActiveRoute<any, any, any>[];
}

export interface RouterActions {
  setState: { state: RouterState };
}

export interface CreateRouterReducerOptions<TNamespace extends string> {
  namespace: TNamespace;
}

export function createRouterReducer<TNamespace extends string>({
  namespace,
}: CreateRouterReducerOptions<TNamespace>): [
  Reducer<TNamespace, RouterState, unknown>,
  Actions<RouterActions>
] {
  return createReducer({
    namespace,
    initialState: typeOf<RouterState>({}),
    reducers: {
      setState(state, action: { state: RouterState }) {
        return action.state;
      },
    },
  });
}
