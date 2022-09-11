import { ClientAdapter, RequestMessage, ServerAdapterAsync } from './message';

interface ChanneledMessage {
  channel: string;
  message: any;
}

export function createChromeRuntimeClientAdapter(
  channel: string
): ClientAdapter {
  return {
    name: `ClientAdapter[${channel}]`,
    send(message: RequestMessage) {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { channel, message } as ChanneledMessage,
          resolve
        );
      });
    },
  };
}

export function createChromeRuntimeServerAdapter(
  channel: string,
  tabId?: number
): ServerAdapterAsync {
  return {
    name: `ServerAdapterAsync[${channel}]`,
    startAsync(requestHandler) {
      const listener = (
        message: ChanneledMessage,
        sender: chrome.runtime.MessageSender,
        sendResponse: (message: any) => void
      ) => {
        if (
          (tabId === undefined || sender.tab?.id === tabId) &&
          message.channel === channel
        ) {
          const result = requestHandler(message.message);
          if (result instanceof Promise) {
            result.then(sendResponse);
          } else {
            sendResponse(result);
          }
        }
      };
      chrome.runtime.onMessage.addListener(listener);

      return {
        stop() {
          chrome.runtime.onMessage.removeListener(listener);
        },
      };
    },
  };
}
