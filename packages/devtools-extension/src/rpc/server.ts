import { MessageListener, Receiver, Sender } from './message';

export interface Server {
  stop(): void;
}

export function startServer<T>(receiver: Receiver, prototype: T): Server {
  const messageListener: MessageListener = (message, sendResponseMessage) => {
    try {
      const success = (prototype as any)[message.func].apply(
        prototype,
        message.args
      );
      sendResponseMessage({
        success,
      });
    } catch (e) {
      const failure =
        e instanceof Error ? `${e.name}: ${e.message}` : String(e);
      sendResponseMessage({
        failure,
      });
    }
  };
  const connection = receiver.addMessageListener(messageListener);

  return {
    stop() {
      connection.removeMessageListener();
    },
  };
}

export function startProxyServer(receiver: Receiver, sender: Sender): Server {
  const messageListener: MessageListener = (message, sendResponseMessage) => {
    sender.sendMessage(message, sendResponseMessage);
  };
  const connection = receiver.addMessageListener(messageListener);

  return {
    stop() {
      connection.removeMessageListener();
    },
  };
}
