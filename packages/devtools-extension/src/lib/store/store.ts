import {
  BehaviorSubject,
  Observable,
  observeOn,
  PartialObserver,
  queueScheduler,
  scan,
  Subject,
  subscribeOn,
} from 'rxjs';
import { Action, createAction } from './action';
import { Reducer } from './reducer';
import { Reaction } from './reaction';
import { Super } from './super';
import { Selector } from './selector';
import { inspect } from '@rxjs-insights/console';

export const ReducerAdded = createAction<{ slice: string }>(
  '<store>',
  'ReducerAdded'
);
export const ReactionAdded = createAction<void>('<store>', 'ReactionAdded');

export type Slice<SLICE extends string, STATE> = {
  [name in SLICE]: STATE;
};

export type SliceName<SLICE extends Slice<any, any>> = SLICE extends Slice<
  infer NAME,
  any
>
  ? NAME
  : never;

export type SliceState<SLICE extends Slice<any, any>> = SLICE extends Slice<
  any,
  infer STATE
>
  ? STATE
  : never;

export type State<STORE extends Store<any>> = STORE extends Store<infer STATE>
  ? STATE
  : never;

export class Store<
  STATE extends Record<string, any> = {}
> extends Observable<STATE> {
  private readonly actionSubject = new Subject<Action>();
  private readonly stateSubject = new BehaviorSubject<STATE>({} as STATE);
  private readonly actionObserver: PartialObserver<Action> = {
    next: (value) => this.actionSubject.next(value),
    error: (error) => {
      console.error(error);
      this.actionSubject.error(error);
    },
  };
  private readonly reducers: Reducer<string, any, any>[] = [];

  constructor() {
    super((observer) => this.stateSubject.subscribe(observer));
    this.actionSubject
      .pipe(
        scan((state: STATE, action) => {
          const nextState: any = {};
          let stateChanged = false;
          for (const reducer of this.reducers) {
            const slice = state[reducer.slice];
            const nextSlice = reducer.reduce(slice, action, this as any);
            nextState[reducer.slice] = nextSlice;
            if (slice !== nextSlice) {
              stateChanged = true;
            }
          }
          return stateChanged ? nextState : state;
        }, {})
      )
      .subscribe(this.stateSubject);

    inspect(this.actionSubject);
    inspect(this.stateSubject);
  }

  get(): STATE;
  get<RESULT>(selector: Selector<STATE, RESULT>): RESULT;
  get(selector?: Selector<STATE, any>): any {
    if (selector) {
      return selector.select(this.stateSubject.getValue());
    } else {
      return this.stateSubject.getValue();
    }
  }

  dispatch(action: Action) {
    this.actionSubject.next(action);
  }

  addReducer<
    REDUCER_SLICE extends string,
    REDUCER_STATE,
    REQUIRED_STATE extends Super<STATE>
  >(
    reducer: Reducer<REDUCER_SLICE, REDUCER_STATE, REQUIRED_STATE>
  ): Store<STATE & Slice<REDUCER_SLICE, REDUCER_STATE>> {
    this.reducers.push(reducer);
    this.dispatch(ReducerAdded({ slice: reducer.slice }));
    return this;
  }

  addReaction<REQUIRED_STATE extends Super<STATE>>(
    reaction: Reaction<REQUIRED_STATE, any>
  ) {
    reaction
      .react(this.actionSubject.asObservable(), reaction.deps?.(this as any))
      .pipe(subscribeOn(queueScheduler), observeOn(queueScheduler))
      .subscribe(this.actionObserver);
    this.dispatch(ReactionAdded());
    return this;
  }
}

export function createStore() {
  return new Store();
}
