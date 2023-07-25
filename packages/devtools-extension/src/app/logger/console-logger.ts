import { Logger, LoggerFactory, LoggerOptions } from '@app/logger/logger';

export class ConsoleLogger implements Logger {
  constructor(private readonly type: string) {}
  info(content: string, options?: LoggerOptions): void {
    if (options !== undefined) {
      console.info(`[${this.type}]`, content, options);
    } else {
      console.info(`[${this.type}]`, content);
    }
  }

  warn(content: string, options?: LoggerOptions): void {
    if (options !== undefined) {
      console.warn(`[${this.type}]`, content, options);
    } else {
      console.warn(`[${this.type}]`, content);
    }
  }

  error(content: string, options?: LoggerOptions): void {
    if (options !== undefined) {
      console.error(`[${this.type}]`, content, options);
    } else {
      console.error(`[${this.type}]`, content);
    }
  }
}

export class ConsoleLoggerFactory implements LoggerFactory {
  createLogger(type: string): Logger {
    return new ConsoleLogger(type);
  }
}
