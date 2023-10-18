import { ActionSource } from './action-source';
import { Component } from './container';

export interface ActionType<TPayload> {
  namespace: string;
  name: string;
  (payload: TPayload): Action<TPayload>;
  is(action: Action<unknown>): action is Action<TPayload>;
}

export interface Action<TPayload = unknown> {
  namespace: string;
  name: string;
  payload: TPayload;
}

export interface CreateActionsOptions {
  namespace: string;
}

export type ActionTypes<TActionPayloads> = {
  [TActionName in keyof TActionPayloads]: ActionType<
    TActionPayloads[TActionName]
  >;
};

export function createActions<TActionPayloads>({
  namespace,
}: CreateActionsOptions): ActionTypes<TActionPayloads> {
  return new Proxy(
    {},
    {
      get(
        target: Record<string, ActionType<unknown>>,
        name: string
      ): ActionType<unknown> {
        let actionFactory = target[name];
        if (actionFactory === undefined) {
          actionFactory = Object.defineProperties(
            (payload: unknown) => ({ namespace, name, payload }),
            {
              namespace: { value: namespace },
              name: { value: name },
              is: {
                value: (action: Action<unknown>): action is Action<unknown> =>
                  action.namespace === namespace && action.name === name,
              },
            }
          ) as ActionType<unknown>;
          target[name] = actionFactory;
        }
        return actionFactory;
      },
    }
  ) as ActionTypes<TActionPayloads>;
}
