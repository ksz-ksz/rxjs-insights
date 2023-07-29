export interface ActionFactory<TPayload> {
  namespace: string;
  name: string;
  (payload: TPayload): Action<TPayload>;
  is(action: Action<unknown>): action is Action<TPayload>;
}

export interface Action<TPayload> {
  namespace: string;
  name: string;
  payload: TPayload;
}

export interface ActionPayloadSpecs {
  [type: string]: unknown;
}

export interface CreateActionsOptions {
  namespace: string;
}

export type Actions<TActionPayloads extends ActionPayloadSpecs> = {
  [TActionName in keyof TActionPayloads]: ActionFactory<TActionPayloads[TActionName]>;
};

export function createActions<TActionPayloads extends ActionPayloadSpecs>({ namespace }: CreateActionsOptions): Actions<TActionPayloads> {
  return new Proxy(
    {},
    {
      get(target: Record<string, ActionFactory<unknown>>, name: string): ActionFactory<unknown> {
        let actionFactory = target[name];
        if (actionFactory === undefined) {
          actionFactory = Object.defineProperties((payload: unknown) => ({ namespace, name, payload }), {
            namespace: { value: namespace },
            name: { value: name },
            is: { value: (action: Action<unknown>): action is Action<unknown> => action.namespace === namespace && action.name === name },
          }) as ActionFactory<unknown>;
          target[name] = actionFactory;
        }
        return actionFactory;
      },
    }
  ) as Actions<TActionPayloads>;
}
