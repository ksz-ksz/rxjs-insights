import { Command, CommandType } from './command';
import { HasSlice } from './slice';

export interface Reducer<STATE> {
  (state: STATE, command: Command<any>): STATE;
}

export interface When<STATE, PAYLOAD> {
  commandType: CommandType<PAYLOAD>;
  then: (state: STATE, payload: PAYLOAD, commandName: string) => STATE | void;
}

export function when<PAYLOAD, STATE>(
  commandType: CommandType<PAYLOAD>,
  then: (state: STATE, payload: PAYLOAD, commandName: string) => STATE | void
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
    string,
    (state: STATE, payload: any, commandName: string) => STATE | void
  >(whens.map(({ commandType, then }) => [commandType.commandName, then]));
  return (state, command) => {
    const then = map.get(command.commandName);
    if (then) {
      const returnedState = then(state, command.payload, command.commandName);
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
