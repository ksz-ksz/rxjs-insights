import 'zone.js';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import { createRuntimeReceiver, startServer } from '@rpc';
import { Devtools, Notifier } from '@rpc/protocols';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);

startServer<Devtools>(createRuntimeReceiver('devtools'), {
  isActive(): boolean {
    return true;
  },
});

startServer<Notifier>(createRuntimeReceiver('notifier'), {
  ping(id: number): string {
    return `pong from devtools #${id}`;
  },
});
