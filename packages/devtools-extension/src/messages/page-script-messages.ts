import { Message, MessageHandler } from './message';
import { MessageEvent } from './message-event';

export namespace PageScriptMessages {
  export function toContentScript(message: Message) {
    document.dispatchEvent(new MessageEvent(message));
  }
  export function fromContentScript(handler: MessageHandler) {
    document.addEventListener(
      MessageEvent.TYPE,
      (event: Event | MessageEvent) => {
        if ('message' in event) {
          handler(event.message);
        }
      }
    );
  }
}
