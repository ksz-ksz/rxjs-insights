export interface CommandType<PAYLOAD> {
  commandName: string;
  (payload: PAYLOAD): Command<PAYLOAD>;
}

export interface Command<PAYLOAD> {
  commandName: string;
  payload: PAYLOAD;
}

export function createCommand<PAYLOAD>(
  name: string,
  domainName?: string
): CommandType<PAYLOAD> {
  const commandName = domainName ? `${domainName}/${name}` : name;
  return Object.assign(
    (payload: PAYLOAD) => ({
      commandName,
      payload,
    }),
    { commandName }
  );
}
