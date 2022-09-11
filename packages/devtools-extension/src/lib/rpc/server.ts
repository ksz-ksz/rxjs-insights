import {
  ClientAdapter,
  RequestHandlerSync,
  ServerAdapter,
  ServerAdapterAsync,
} from './message';

export interface Server {
  stop(): void;
}

function startSingle(
  adapter: ServerAdapter,
  requestHandler: RequestHandlerSync
) {
  if ('startSync' in adapter) {
    return adapter.startSync(requestHandler);
  } else {
    return adapter.startAsync(requestHandler);
  }
}

function start(
  adapterOrAdapters: ServerAdapter | ServerAdapter[],
  requestHandler: RequestHandlerSync
): Server {
  if (Array.isArray(adapterOrAdapters)) {
    const servers: Server[] = [];
    for (const adapter of adapterOrAdapters) {
      servers.push(startSingle(adapter, requestHandler));
    }
    return {
      stop() {
        for (const server of servers) {
          server.stop();
        }
      },
    };
  } else {
    return startSingle(adapterOrAdapters, requestHandler);
  }
}

export function startServer<T>(
  adapterOrAdapters: ServerAdapter | ServerAdapter[],
  implementation: T
): Server {
  return start(adapterOrAdapters, (message) => {
    try {
      return {
        success: (implementation as any)[message.func].apply(
          implementation,
          message.args
        ),
      };
    } catch (e) {
      console.error(e);
      return {
        failure: e instanceof Error ? `${e.name}: ${e.message}` : String(e),
      };
    }
  });
}

export function startProxyServer(
  serverAdapter: ServerAdapterAsync,
  clientAdapter: ClientAdapter
): Server {
  return serverAdapter.startAsync((message) => clientAdapter.send(message));
}
