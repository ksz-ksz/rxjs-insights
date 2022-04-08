import { BehaviorSubject, map, Observable, reduce, share, Subject } from 'rxjs';

export interface CommandType<PAYLOAD> {
  commandName: string;
  (payload: PAYLOAD): Command<PAYLOAD>;
}

export interface Command<PAYLOAD> {
  commandType: CommandType<PAYLOAD>;
  payload: PAYLOAD;
}

export interface Query<INPUT, OUTPUT> {
  (input: INPUT): OUTPUT;
}

export interface Store<STATE> {
  command<PAYLOAD>(command: Command<PAYLOAD>): void;
  query<RESULT>(query: Query<STATE, RESULT>): Observable<RESULT>;
}

export interface Reducer<STATE> {
  (state: STATE, command: Command<any>): STATE;
}

export interface When<STATE, PAYLOAD> {
  commandType: CommandType<PAYLOAD>;
  then: (
    state: STATE,
    payload: PAYLOAD,
    commandType: CommandType<PAYLOAD>
  ) => STATE | void;
}

export interface Effect<STATE> {
  (command$: Observable<Command<any>>, state$: Observable<STATE>): Observable<
    Command<any>
  >;
}

export function createCommand<PAYLOAD>(
  commandName: string
): CommandType<PAYLOAD> {
  const commandType: CommandType<PAYLOAD> = Object.assign(
    (payload) => ({
      commandType,
      payload,
    }),
    { commandName }
  );
  return commandType;
}

export function when<PAYLOAD, STATE>(
  commandType: CommandType<PAYLOAD>,
  then: (
    state: STATE,
    payload: PAYLOAD,
    commandType: CommandType<PAYLOAD>
  ) => STATE | void
): When<STATE, PAYLOAD> {
  return {
    commandType,
    then,
  };
}

export function createReducer<STATE>(
  whens: When<STATE, any>[]
): Reducer<STATE> {
  const map = new Map<
    CommandType<any>,
    (state: STATE, payload: any, commandType: CommandType<any>) => STATE | void
  >(whens.map(({ commandType, then }) => [commandType, then]));
  return (state, command) => {
    const then = map.get(command.commandType);
    if (then) {
      const returnedState = then(state, command.payload, command.commandType);
      if (returnedState) {
        return returnedState;
      } else {
        return state;
      }
    } else {
      return state;
    }
  };
}

export function createStore<STATE>({
  initialState,
  reducer,
  effects,
}: {
  initialState: STATE;
  reducer: Reducer<STATE>;
  effects: Effect<STATE>[];
}): Store<STATE> {
  const commandSubject = new Subject<Command<any>>();
  const command$ = commandSubject.asObservable();

  const state$ = command$.pipe(
    reduce(reducer, initialState),
    share({
      connector: () => new BehaviorSubject(initialState),
      resetOnError: false,
      resetOnComplete: false,
      resetOnRefCountZero: false,
    })
  );

  const subscription = state$.subscribe();

  for (const effect of effects) {
    subscription.add(
      effect(command$, state$).subscribe({
        next(command) {
          commandSubject.next(command);
        },
        error(error) {
          commandSubject.error(error);
        },
      })
    );
  }

  return {
    command<PAYLOAD>(command: Command<PAYLOAD>) {
      commandSubject.next(command);
    },
    query<RESULT>(query: Query<STATE, RESULT>): Observable<RESULT> {
      return state$.pipe(map(query));
    },
  };
}
