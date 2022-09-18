import { TargetsNotificationsChannel } from '@app/protocols/targets-notifications';
import { ReloadNotificationChannel } from '@app/protocols/reload-notification';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (
    message.channel === TargetsNotificationsChannel ||
    message.channel === ReloadNotificationChannel
  ) {
    chrome.runtime.sendMessage(
      {
        ...message,
        channel: message.channel + sender.tab?.id,
      },
      sendResponse
    );
    return true;
  }
});
