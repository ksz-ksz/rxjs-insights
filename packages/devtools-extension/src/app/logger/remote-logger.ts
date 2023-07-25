import { Logger, LoggerFactory, LoggerOptions } from '@app/logger/logger';
import { getUserId } from '@app/logger/get-user-id';
import { getSessionId } from '@app/logger/get-session-id';
import { logsIngestUrl, logsIngestApiToken } from 'env';

export interface AttributesProvider {
  getAttributes(): Promise<Record<string, string | number | boolean>>;
}

function getSerializableValue(value: any) {
  try {
    JSON.stringify(value);
    return value;
  } catch (e) {
    try {
      return String(value);
    } catch (e) {
      return 'non-serializable';
    }
  }
}

function formatObjectError(error: any) {
  let name: string | undefined = undefined;
  let message: string | undefined = undefined;
  let stack: string | undefined = undefined;
  let cause: any | undefined = undefined;
  let details: Record<string, any> | undefined = undefined;

  const keys = Reflect.ownKeys(error);
  for (const key of keys) {
    switch (key) {
      case 'name':
        name = error.name;
        break;
      case 'message':
        message = error.message;
        break;
      case 'stack':
        stack = error.stack;
        break;
      case 'cause':
        cause = error.cause;
        break;
      default:
        details = details ?? {};
        details[String(key)] = getSerializableValue(error[key]);
        break;
    }
  }

  let content = '';

  if (stack !== undefined) {
    content += `${stack}\n`;
  } else if (message !== undefined) {
    content += `${name ?? 'Error'}: ${message}\n`;
  } else {
    content += `${name ?? 'Error'}\n`;
  }
  if (details !== undefined) {
    content += `Details:\n${JSON.stringify(details)}\n`;
  }
  if (cause !== undefined) {
    content += `Caused by:\n${formatError(cause)}\n`;
  }
  return content;
}

function formatPrimitiveError(error: any) {
  return `Error: ${String(error)}\n`;
}

function formatError(error: any) {
  if (error === null) {
    return formatPrimitiveError(error);
  }
  switch (typeof error) {
    case 'function':
    case 'object':
      return formatObjectError(error);
    default:
      return formatPrimitiveError(error);
  }
}

function formatContent(content: string, error?: any) {
  if (error !== undefined) {
    return `${content}\n${formatError(error)}`;
  } else {
    return content;
  }
}

export class RemoteLoggerAttributesProvider implements AttributesProvider {
  private attributes: Record<string, any> | undefined = undefined;

  async getAttributes(): Promise<Record<string, any>> {
    if (this.attributes === undefined) {
      this.attributes = {
        userId: await getUserId(),
        sessionId: await getSessionId(),
        userAgent: navigator.userAgent,
      };
    }
    return this.attributes;
  }
}

export class RemoteLogger implements Logger {
  constructor(
    private readonly type: string,
    private readonly attributesProvider: AttributesProvider
  ) {}

  info(content: string, options?: LoggerOptions): void {
    this.log('info', content, options);
  }

  warn(content: string, options?: LoggerOptions): void {
    this.log('warn', content, options);
  }

  error(content: string, options?: LoggerOptions): void {
    this.log('error', content, options);
  }

  private async log(
    level: 'info' | 'warn' | 'error',
    content: string,
    options?: LoggerOptions
  ) {
    const timestamp = Date.now();
    const attributes = await this.attributesProvider.getAttributes();
    const body = JSON.stringify([
      {
        type: this.type,
        level,
        content: formatContent(content, options?.error),
        timestamp,
        ...attributes,
        ...options?.attributes,
      },
    ]);
    console.log({ body });
    const response = await fetch(logsIngestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Api-Token ${logsIngestApiToken}`,
      },
      body,
    });
    if (response.status !== 204) {
      const responseText = await response.text();
      if (response.status === 200) {
        console.info(
          `Log ingest: only a part of input events were ingested due to event invalidity. ${responseText}`
        );
      } else {
        console.warn(`Log ingest: failed. ${responseText}`);
      }
    }
  }
}

export class RemoteLoggerFactory implements LoggerFactory {
  createLogger(type: string): Logger {
    return new RemoteLogger(type, new RemoteLoggerAttributesProvider());
  }
}
