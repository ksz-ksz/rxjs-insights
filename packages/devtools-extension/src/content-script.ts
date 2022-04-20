import { ContentScriptMessages } from './messages/content-script-messages';
import { DevToolsStatus } from './messages/dev-tools-status';
import { Message } from './messages/message';

ContentScriptMessages.toExtension(
  DevToolsStatus.IsActiveRequest(),
  (message: Message) => {
    if (DevToolsStatus.IsActiveResponse.is(message)) {
      if (message.payload.active) {
        injectPageScript(chrome.runtime.getURL('/dist/page-script.js'));
      }
    }
  }
);

function injectPageScript(src: string) {
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', src);
  document.documentElement.appendChild(script);
}
