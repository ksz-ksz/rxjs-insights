export interface Action<PAYLOAD = unknown> {
  type: string;
  payload: PAYLOAD;
}

export interface ActionFactory<PAYLOAD = unknown> {
  type: string;
  (payload: PAYLOAD): Action<PAYLOAD>;
}

export type ActionFactoryPayload<T> = T extends ActionFactory<infer PAYLOAD>
  ? PAYLOAD
  : never;

export function createAction<PAYLOAD>(
  source: string,
  action: string
): ActionFactory<PAYLOAD> {
  const type = source ? `[${source}] ${action}` : action;
  return Object.assign(
    (payload: PAYLOAD) => ({
      type,
      payload,
    }),
    { type }
  );
}

export type ActionFactories<ACTION_TYPES extends Record<string, any>> = {
  [K in keyof ACTION_TYPES]: ActionFactory<ACTION_TYPES[K]>;
};

export function createActions<ACTION_TYPES extends Record<string, any>>(
  source: string
): ActionFactories<ACTION_TYPES> {
  return new Proxy(
    {},
    {
      get(
        target: Record<string, ActionFactory>,
        property: string
      ): ActionFactory {
        if (target[property] === undefined) {
          target[property] = createAction(source, property);
        }
        return target[property];
      },
    }
  ) as any;
}
