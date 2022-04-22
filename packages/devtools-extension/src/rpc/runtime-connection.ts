import {
  MessageListener,
  Receiver,
  RequestMessage,
  ResponseMessage,
  Sender,
} from './message';

interface ChanneledMessage {
  channel: string;
  message: any;
}

export function createRuntimeSender(channel: string): Sender {
  return {
    sendMessage(
      message: RequestMessage,
      responseMessageHandler: (message: ResponseMessage) => void
    ) {
      chrome.runtime.sendMessage(
        { channel, message } as ChanneledMessage,
        responseMessageHandler
      );
    },
  };
}

export function createRuntimeReceiver(channel: string): Receiver {
  return {
    addMessageListener(messageListener: MessageListener) {
      const listener = (
        message: ChanneledMessage,
        sender: any,
        sendResponse: (message: any) => void
      ) => {
        if (message.channel === channel) {
          messageListener(message.message, sendResponse);
        }
      };
      chrome.runtime.onMessage.addListener(listener);

      return {
        removeMessageListener() {
          chrome.runtime.onMessage.removeListener(listener);
        },
      };
    },
  };
}
