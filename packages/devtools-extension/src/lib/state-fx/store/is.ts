import { Action, ActionFactory } from './actions';

export type ExtractPayload<T> = T extends ActionFactory<infer T> ? T : never;

export function is<T extends ActionFactory<any>[]>(
  ...actions: [...T]
): (x: any) => x is Action<ExtractPayload<T[number]>> {
  return (x): x is Action<ExtractPayload<T[number]>> =>
    actions.some((action) => action.is(x));
}
