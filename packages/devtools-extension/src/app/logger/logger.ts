export interface LoggerOptions {
  error: any;
  attributes: Record<string, string | number | boolean>;
}

export interface Logger {
  info(content: string, options?: LoggerOptions): void;

  warn(content: string, options?: LoggerOptions): void;

  error(content: string, options?: LoggerOptions): void;
}

export interface LoggerFactory {
  createLogger(type: string): Logger;
}

let LoggerFactory: LoggerFactory | undefined = undefined;

export function setLoggerFactory(loggerFactory: LoggerFactory): void {
  if (LoggerFactory !== undefined) {
    throw new Error('LoggerFactory already set');
  }
  LoggerFactory = loggerFactory;
}

export function createLogger(type: string): Logger {
  if (LoggerFactory === undefined) {
    throw new Error('LoggerFactory not set');
  }
  return LoggerFactory.createLogger(type);
}
