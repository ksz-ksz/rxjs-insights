export interface ActionType<TPayload = unknown> {
  namespace: string;
  name: string;
  (payload: TPayload): Action<TPayload>;
  is(action: Action): action is Action<TPayload>;
}

export interface Action<TPayload = unknown> {
  namespace: string;
  name: string;
  payload: TPayload;
}

export interface CreateActionsOptions {
  namespace: string;
  createName?(name: string): string;
}

export type ActionTypes<TActionPayloads> = {
  [TActionName in keyof TActionPayloads]: ActionType<
    TActionPayloads[TActionName]
  >;
};

export type ExtractActionTypeFnPayload<T> = T extends (
  payload: infer T
) => unknown
  ? T
  : never;

export type ActionTypeFn<TFn extends (payload: any) => any> = TFn & {
  namespace: string;
  name: string;
  is(action: Action): action is Action<ExtractActionTypeFnPayload<TFn>>;
};

export type ActionTypeFns<TFns extends { [name: string]: ActionTypeFn<any> }> =
  {
    [TActionName in keyof TFns]: ActionTypeFn<TFns[TActionName]>;
  };

export function createActions<TActionPayloads>({
  namespace,
  createName = (name) => name,
}: CreateActionsOptions): ActionTypes<TActionPayloads> {
  return new Proxy(
    {},
    {
      get(
        target: Record<string, ActionType<unknown>>,
        key: string
      ): ActionType<unknown> {
        const name = createName(key);
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
