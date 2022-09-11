import {
  createChromeRuntimeClientAdapter,
  createClient,
  createDocumentEventServerAdapter,
  startProxyServer,
} from '@lib/rpc';
import { TargetsNotificationsChannel } from '@app/protocols/targets-notifications';
import {
  ReloadNotification,
  ReloadNotificationChannel,
} from '@app/protocols/reload-notification';

sendReloadNotification();

injectPageScript();

startProxyServer(
  createDocumentEventServerAdapter(TargetsNotificationsChannel),
  createChromeRuntimeClientAdapter(TargetsNotificationsChannel)
);

function injectPageScript() {
  const parent = document.head ?? document.documentElement;
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = chrome.runtime.getURL('/dist/page-script.js');
  script.async = false;
  script.onload = () => {
    parent.removeChild(script);
  };
  parent.appendChild(script);
}

function sendReloadNotification() {
  const reloadNotificationClient = createClient<ReloadNotification>(
    createChromeRuntimeClientAdapter(ReloadNotificationChannel)
  );
  void reloadNotificationClient.notifyReload();
}
