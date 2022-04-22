import {
  MessageListener,
  Receiver,
  RequestMessage,
  ResponseMessage,
  Sender,
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

export function createDocumentEventSender(channel: string): Sender {
  let nextId = 0;

  return {
    sendMessage(
      message: RequestMessage,
      responseMessageHandler: (message: ResponseMessage) => void
    ) {
      const id = nextId++;
      const listener = (event: MessageEvent) => {
        if (
          event.detail.channel === channel &&
          event.detail.id === id &&
          event.detail.type === 'response'
        ) {
          responseMessageHandler(event.detail.message);
          document.removeEventListener(MessageEvent.TYPE, listener as any);
        }
      };
      document.addEventListener(MessageEvent.TYPE, listener as any);
      document.dispatchEvent(
        new MessageEvent({ channel, id, type: 'request', message })
      );
    },
  };
}

export function createDocumentEventReceiver(channel: string): Receiver {
  return {
    addMessageListener(messageListener: MessageListener) {
      const listener = (event: MessageEvent) => {
        if (
          event.detail.channel === channel &&
          event.detail.type === 'request'
        ) {
          messageListener(event.detail.message, (responseMessage) => {
            document.dispatchEvent(
              new MessageEvent({
                channel,
                id: event.detail.id,
                type: 'response',
                message: responseMessage,
              })
            );
          });
        }
      };
      document.addEventListener(MessageEvent.TYPE, listener as any);
      return {
        removeMessageListener: function () {
          document.removeEventListener(MessageEvent.TYPE, listener as any);
        },
      };
    },
  };
}
