import { Message, MessageHandler } from './message';
import { MessageEvent } from './message-event';

export namespace ContentScriptMessages {
  export function toPageScript(message: Message) {
    document.dispatchEvent(new MessageEvent(message));
  }

  export function fromPageScript(handler: MessageHandler) {
    const listener = (event: Event | MessageEvent) => {
      if ('message' in event) {
        handler(event.message);
      }
    };
    document.addEventListener(MessageEvent.TYPE, listener);

    return () => {
      document.removeEventListener(MessageEvent.TYPE, listener);
    };
  }

  export function toExtension(
    message: Message,
    responseHandler?: MessageHandler
  ) {
    chrome.runtime.sendMessage(message, responseHandler);
  }

  export function fromExtension(handler: MessageHandler) {
    chrome.runtime.onMessage.addListener(handler);

    return () => chrome.runtime.onMessage.removeListener(handler);
  }
}
