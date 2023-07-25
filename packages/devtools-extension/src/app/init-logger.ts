import { setLoggerFactory } from '@app/logger/logger';
import { ConsoleLoggerFactory } from '@app/logger/console-logger';
import { RemoteLoggerFactory } from '@app/logger/remote-logger';

// @ts-ignore
if (process.env.NODE_ENV === 'development') {
  setLoggerFactory(new ConsoleLoggerFactory());
} else {
  setLoggerFactory(new RemoteLoggerFactory());
}
