import {
  ClientAdapter,
  RequestMessage,
  ResponseMessage,
  ServerAdapterAsync,
} from './message';

interface MessageEventDetail {
  id: number;
  type: 'request' | 'response';
  channel: string;
  message: any;
}

class MessageEvent extends CustomEvent<MessageEventDetail> {
  static TYPE = 'MessageEvent';

  constructor(detail: MessageEventDetail) {
    super(MessageEvent.TYPE, {
      detail,
    });
  }
}

export function createDocumentEventClientAdapter(
  channel: string
): ClientAdapter {
  let nextId = 0;

  return {
    send(message: RequestMessage) {
      return new Promise((resolve) => {
        const id = nextId++;
        const listener = (event: MessageEvent) => {
          if (
            event.detail.channel === channel &&
            event.detail.id === id &&
            event.detail.type === 'response'
          ) {
            resolve(event.detail.message);
            document.removeEventListener(MessageEvent.TYPE, listener as any);
          }
        };
        document.addEventListener(MessageEvent.TYPE, listener as any);
        document.dispatchEvent(
          new MessageEvent({ channel, id, type: 'request', message })
        );
      });
    },
  };
}

export function createDocumentEventServerAdapter(
  channel: string
): ServerAdapterAsync {
  return {
    startAsync(requestHandler) {
      const listener = (event: MessageEvent) => {
        if (
          event.detail.channel === channel &&
          event.detail.type === 'request'
        ) {
          const result = requestHandler(event.detail.message);
          const sendResponse = (responseMessage: ResponseMessage) => {
            document.dispatchEvent(
              new MessageEvent({
                channel,
                id: event.detail.id,
                type: 'response',
                message: responseMessage,
              })
            );
          };
          if (result instanceof Promise) {
            result.then(sendResponse);
          } else {
            sendResponse(result);
          }
        }
      };
      document.addEventListener(MessageEvent.TYPE, listener as any);
      return {
        stop() {
          document.removeEventListener(MessageEvent.TYPE, listener as any);
        },
      };
    },
  };
}
