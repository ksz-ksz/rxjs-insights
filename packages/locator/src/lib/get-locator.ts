import { NoopLocator } from './noop-locator';
import { StacktraceLocator } from './stacktrace-locator';

function isNodeJs() {
  return Boolean(
    typeof process !== 'undefined' &&
      process &&
      process.versions &&
      process.versions.node
  );
}

export function getLocator() {
  return isNodeJs() ? new NoopLocator() : new StacktraceLocator();
}
