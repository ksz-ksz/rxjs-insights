import { Action, ActionType } from './action';

export type ExtractPayload<T> = T extends ActionType<infer T> ? T : never;

export function is<T extends ActionType<any>[]>(
  ...actions: [...T]
): (x: any) => x is Action<ExtractPayload<T[number]>> {
  return (x): x is Action<ExtractPayload<T[number]>> =>
    actions.some((action) => action.is(x));
}
