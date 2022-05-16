import {
  createChromeRuntimeClientAdapter,
  createDocumentEventServerAdapter,
  startProxyServer,
} from '@lib/rpc';
import { TargetsNotificationsChannel } from '@app/protocols/targets-notifications';

injectPageScript(chrome.runtime.getURL('/dist/page-script.js'));

startProxyServer(
  createDocumentEventServerAdapter(TargetsNotificationsChannel),
  createChromeRuntimeClientAdapter(TargetsNotificationsChannel)
);

function injectPageScript(src: string) {
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', src);
  document.documentElement.appendChild(script);
}
