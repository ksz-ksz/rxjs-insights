import {
  createChromeRuntimeClientAdapter,
  createDocumentEventServerAdapter,
  startProxyServer,
} from '@rpc';

injectPageScript(chrome.runtime.getURL('/dist/page-script.js'));

startProxyServer(
  createDocumentEventServerAdapter('notifier'),
  createChromeRuntimeClientAdapter('notifier')
);

function injectPageScript(src: string) {
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', src);
  document.documentElement.appendChild(script);
}
