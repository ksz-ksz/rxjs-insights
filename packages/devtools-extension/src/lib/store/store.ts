import {
  BehaviorSubject,
  map,
  merge,
  Observable,
  scan,
  share,
  Subject,
} from 'rxjs';
import { Query } from './query';
import { Command } from './command';
import { Slice } from './slice';
import { Reducer } from './reducer';
import { Effect } from './effect';
import { inspect } from '@rxjs-insights/console';

export interface Store<STATE> {
  command<PAYLOAD>(command: Command<PAYLOAD>): void;

  query<RESULT>(query: Query<STATE, RESULT>): Observable<RESULT>;
}

export type State<DOMAINS extends Array<Slice<any, any>>> = {
  [NAME in DOMAINS[number]['name']]: Extract<
    DOMAINS[number],
    { name: NAME }
  >['initialState'];
};

function combinedInitialState(domains: Array<Slice<any, any>>) {
  const state: any = {};
  for (const domain of domains) {
    state[domain.name] = domain.initialState;
  }

  return state;
}

function combinedReducer(domains: Array<Slice<any, any>>): Reducer<any> {
  return (state, command) => {
    const nextState: any = {};
    let stateChanged = false;
    for (const domain of domains) {
      const domainState = state[domain.name];
      const nextDomainState = domain.reducer(domainState, command);
      nextState[domain.name] = nextDomainState;
      if (domainState !== nextDomainState) {
        stateChanged = true;
      }
    }
    return stateChanged ? nextState : state;
  };
}

function combinedEffects(domains: Array<Slice<any, any>>): Effect {
  return (command$) => {
    const observables: Observable<Command<any>>[] = [];
    for (const domain of domains) {
      for (const effect of domain.effects) {
        observables.push(effect(command$));
      }
    }

    return merge(...observables);
  };
}

export function createStore<DOMAINS extends Array<Slice<any, any>>>(
  domains: DOMAINS
): Store<State<DOMAINS>> {
  const initialState = combinedInitialState(domains);
  const reducer = combinedReducer(domains);
  const effects = combinedEffects(domains);

  const commandSubject = new Subject<Command<any>>();
  const command$ = commandSubject.asObservable();

  const state$ = command$.pipe(
    scan(reducer, initialState),
    share({
      connector: () => new BehaviorSubject(initialState),
      resetOnError: false,
      resetOnComplete: false,
      resetOnRefCountZero: false,
    })
  );

  const subscription = state$.subscribe();

  inspect(subscription);

  subscription.add(
    effects(command$).subscribe({
      next(command) {
        commandSubject.next(command);
      },
      error(error) {
        commandSubject.error(error);
      },
    })
  );

  return {
    command<PAYLOAD>(command: Command<PAYLOAD>) {
      commandSubject.next(command);
    },
    query<RESULT>(query: Query<State<DOMAINS>, RESULT>): Observable<RESULT> {
      return state$.pipe(map(query.select));
    },
  };
}
