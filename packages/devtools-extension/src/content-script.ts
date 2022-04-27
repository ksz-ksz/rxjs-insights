import {
  createClient,
  createDocumentEventReceiver,
  createRuntimeSender,
  startProxyServer,
  startServer,
} from '@rpc';
import { Devtools, Notifier } from '@rpc/protocols';

console.log('hi');
const devtoolsClient = createClient<Devtools>(createRuntimeSender('devtools'));

// devtoolsClient.isActive().then((isActive) => {
//   if (isActive) {
injectPageScript(chrome.runtime.getURL('/dist/page-script.js'));
// }
// });

startProxyServer(
  createDocumentEventReceiver('notifier'),
  createRuntimeSender('notifier')
);

function injectPageScript(src: string) {
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', src);
  document.documentElement.appendChild(script);
}
