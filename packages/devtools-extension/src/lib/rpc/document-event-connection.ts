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

function getOriginalDelegate<T>(target: T): T {
  return '__zone_symbol__OriginalDelegate' in target
    ? (target as any).__zone_symbol__OriginalDelegate
    : target;
}

export function createDocumentEventClientAdapter(
  channel: string
): ClientAdapter {
  let nextId = 0;

  return {
    send(message: RequestMessage) {
      // mitigates https://github.com/angular/angular/issues/44446
      const addEventListener = getOriginalDelegate(document.addEventListener);
      const removeEventListener = getOriginalDelegate(
        document.removeEventListener
      );
      return new Promise((resolve) => {
        const id = nextId++;
        const listener = (event: MessageEvent) => {
          if (
            event.detail.channel === channel &&
            event.detail.id === id &&
            event.detail.type === 'response'
          ) {
            resolve(event.detail.message);
            removeEventListener.call(
              document,
              MessageEvent.TYPE,
              listener as any
            );
          }
        };
        addEventListener.call(document, MessageEvent.TYPE, listener as any);
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
      // mitigates https://github.com/angular/angular/issues/44446
      const addEventListener = getOriginalDelegate(document.addEventListener);
      const removeEventListener = getOriginalDelegate(
        document.removeEventListener
      );
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
      addEventListener.call(document, MessageEvent.TYPE, listener as any);
      return {
        stop() {
          removeEventListener.call(
            document,
            MessageEvent.TYPE,
            listener as any
          );
        },
      };
    },
  };
}
