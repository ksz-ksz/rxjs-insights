import { CommandType, createCommand } from './command';
import { createQuery, Query } from './query';
import { Reducer } from './reducer';
import { Effect } from './effect';
import { HasSlice, Slice } from './slice';

export interface Domain<NAME extends string, STATE> {
  readonly name: NAME;
  createCommand<PAYLOAD>(commandName: string): CommandType<PAYLOAD>;
  createQuery<RESULT>(
    select: (state: STATE) => RESULT
  ): Query<HasSlice<NAME, STATE>, RESULT>;
  createSlice(slice: {
    initialState: STATE;
    reducer: Reducer<STATE>;
    effects: Effect[];
  }): Slice<NAME, STATE>;
}

export function createDomain<NAME extends string, STATE>(
  domainName: NAME
): Domain<NAME, STATE> {
  return {
    name: domainName,
    createCommand<PAYLOAD>(commandName: string): CommandType<PAYLOAD> {
      return createCommand<PAYLOAD>(commandName, domainName);
    },
    createQuery<RESULT>(
      select: (state: STATE) => RESULT
    ): Query<HasSlice<NAME, STATE>, RESULT> {
      return createQuery<NAME, STATE, RESULT>(select, domainName);
    },
    createSlice({
      initialState,
      reducer,
      effects,
    }: {
      initialState: STATE;
      reducer: Reducer<STATE>;
      effects: Effect[];
    }): Slice<NAME, STATE> {
      return {
        name: domainName,
        initialState,
        reducer,
        effects,
      };
    },
  };
}
