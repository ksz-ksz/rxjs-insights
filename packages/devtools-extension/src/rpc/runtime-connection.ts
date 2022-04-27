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

export function createEvalSender(channel: string): Sender {
  return {
    sendMessage(
      message: RequestMessage,
      responseMessageHandler: (message: ResponseMessage) => void
    ) {
      chrome.devtools.inspectedWindow.eval(
        `__eval__${channel}(${JSON.stringify(message)})`,
        (result, exceptionInfo) => {
          if (exceptionInfo && exceptionInfo.isError) {
            responseMessageHandler({ failure: exceptionInfo.description });
          } else if (exceptionInfo && exceptionInfo.isException) {
            responseMessageHandler({ failure: exceptionInfo.value });
          } else {
            responseMessageHandler({ success: result });
          }
        }
      );
    },
  };
}

export function createEvalReceiver(channel: string): Receiver {
  return {
    addMessageListener(messageListener: MessageListener) {
      (window as any)['__eval__' + channel] = (message: RequestMessage) => {
        let responseMessage;
        messageListener(message, (response) => {
          responseMessage = response;
        });
        return responseMessage;
      };

      return {
        removeMessageListener() {
          delete (window as any)['__eval__' + channel];
        },
      };
    },
  };
}
