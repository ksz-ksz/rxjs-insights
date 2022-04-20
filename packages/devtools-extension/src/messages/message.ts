export interface MessageFactory<PAYLOAD> {
  type: string;
  (payload: PAYLOAD): Message<PAYLOAD>;
  is(message: Message<any>): message is Message<PAYLOAD>;
}

export const enum Component {
  PAGE_SCRIPT,
  CONTENT_SCRIPT,
  EXTENSION,
}

export interface Message<PAYLOAD = unknown> {
  type: string;
  payload: PAYLOAD;
}

export interface MessageHandler {
  (message: Message): void;
}

export interface MessageHandlerWithResponse {
  (message: Message, sendResponse: (message: Message) => void): void;
}

export function createMessage<PAYLOAD = void>(
  type: string
): MessageFactory<PAYLOAD> {
  return Object.assign(
    (payload: PAYLOAD) => ({
      type,
      payload,
    }),
    {
      type,
      is(message: any): message is Message<PAYLOAD> {
        return message?.type === type;
      },
    }
  );
}
