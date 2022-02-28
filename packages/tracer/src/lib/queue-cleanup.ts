/// <reference types="zone.js" />

function isZoneJs() {
  return Boolean(
    typeof Zone !== 'undefined' && Zone && Zone.root && Zone.current
  );
}

export const queueCleanup = isZoneJs()
  ? Zone.root.wrap(queueMicrotask, 'queueCleanup')
  : queueMicrotask;
