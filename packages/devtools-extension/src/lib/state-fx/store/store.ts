import {
  BehaviorSubject,
  Observable,
  observeOn,
  queueScheduler,
  reduce,
  Subject,
  Subscription,
} from 'rxjs';
import { Action } from './action';
import { Reducer } from './reducer';
import { Effect } from './effect';
import { Subtype } from './subtype';
import { produce } from 'immer';

export interface Store<TState> {
  dispatch(action: Action<unknown>): void;
  getState(): TState;
  getStateObservable(): Observable<TState>;
  registerEffect(effect: Effect<TState>): Subscription;
}

export class ReducersComposer<TState> {
  private readonly reducers: Reducer<string, any, any>[] = [];

  add<
    TReducerNamespace extends string,
    TReducerState,
    TReducerStoreState extends Subtype<TState>
  >(
    reducer: Reducer<TReducerNamespace, TReducerState, TReducerStoreState>
  ): ReducersComposer<TState & Record<TReducerNamespace, TReducerState>> {
    this.reducers.push(reducer);
    return this as ReducersComposer<
      TState & Record<TReducerNamespace, TReducerState>
    >;
  }

  get() {
    return this.reducers;
  }
}

export interface CreateStoreOptions<TState> {
  reducers: (composer: ReducersComposer<{}>) => ReducersComposer<TState>;
}

function getInitialState<TState>(reducers: Reducer<string, any, any>[]) {
  const initialState: Record<string, any> = {};
  for (const reducer of reducers) {
    initialState[reducer.namespace] = reducer.initialState;
  }
  return initialState as TState;
}

export function createStore<TState>({
  reducers: createReducers,
}: CreateStoreOptions<TState>): Store<TState> {
  const reducers = createReducers(new ReducersComposer<{}>()).get();
  const actionsSubject = new Subject<Action<unknown>>();
  const actionsObservable = actionsSubject.pipe(observeOn(queueScheduler));
  const stateSubject = new BehaviorSubject<TState>(getInitialState(reducers));
  const stateObservable = stateSubject.asObservable();

  actionsObservable.subscribe({
    next(action) {
      const state = stateSubject.getValue() as Record<string, any>;
      const nextState = produce(state, (draftState) => {
        for (const reducer of reducers) {
          const reducerState = draftState[reducer.namespace];
          draftState[reducer.namespace] = reducer.reduce(
            reducerState,
            action,
            draftState
          );
        }
      });
      if (nextState !== state) {
        stateSubject.next(nextState as TState);
      }
    },
    error(error) {},
    complete() {},
  });

  const store: Store<TState> = {
    dispatch(action: Action<unknown>): void {
      actionsSubject.next(action);
    },
    getState(): TState {
      return stateSubject.getValue();
    },
    getStateObservable(): Observable<TState> {
      return stateObservable;
    },
    registerEffect(effect: Effect<TState>): Subscription {
      return effect.run(actionsObservable, store).subscribe({
        next(action) {
          actionsSubject.next(action);
        },
        error(error) {
          actionsSubject.error(error);
          throw error;
        },
        complete() {},
      });
    },
  };
  return store;
}
