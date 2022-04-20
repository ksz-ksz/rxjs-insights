import 'zone.js';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import { ExtensionMessages } from '../messages/extension-messages';
import { DevToolsStatus } from '../messages/dev-tools-status';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);

ExtensionMessages.fromContentScript((message, sendResponse) => {
  if (DevToolsStatus.IsActiveRequest.is(message)) {
    sendResponse(DevToolsStatus.IsActiveResponse({ active: true }));
  }
});
