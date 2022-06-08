function getOriginalDelegate<T>(target: T): T {
  return '__zone_symbol__OriginalDelegate' in target
    ? (target as any).__zone_symbol__OriginalDelegate
    : target;
}

export function queueCleanup(run: () => void) {
  // mitigates https://github.com/angular/angular/issues/44446
  getOriginalDelegate(queueMicrotask)(run);
}
