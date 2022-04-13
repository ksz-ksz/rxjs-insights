export interface Action<PAYLOAD = unknown> {
  type: string;
  payload: PAYLOAD;
}

export interface ActionFactory<PAYLOAD = unknown> {
  type: string;
  (payload: PAYLOAD): Action<PAYLOAD>;
}

export function createAction<PAYLOAD>(
  actionType: string,
  slice?: string
): ActionFactory<PAYLOAD> {
  const type = slice ? `${slice}/${actionType}` : actionType;
  return Object.assign(
    (payload: PAYLOAD) => ({
      type,
      payload,
    }),
    { type }
  );
}
