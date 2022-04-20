import { MessageHandlerWithResponse } from './message';

export namespace ExtensionMessages {
  export function fromContentScript(handler: MessageHandlerWithResponse) {
    const listener = (request: any, sender: any, sendResponse: any) => {
      handler(request, sendResponse);
    };
    chrome.runtime.onMessage.addListener(listener);

    return () => chrome.runtime.onMessage.removeListener(listener);
  }
}
