import {
  ClientAdapter,
  RequestMessage,
  ResponseMessage,
  ServerAdapterAsync,
} from './message';

interface Data {
  type: '@rxjs-insights/request' | '@rxjs-insights/response';
  id: number;
  channel: string;
  message: any;
}

function getOriginalDelegate<T>(target: T): T {
  return '__zone_symbol__OriginalDelegate' in target
    ? (target as any).__zone_symbol__OriginalDelegate
    : target;
}

export function createPostMessageClientAdapter(channel: string): ClientAdapter {
  let nextId = 0;

  return {
    name: `ClientAdapter[${channel}]`,
    send(message: RequestMessage) {
      // mitigates https://github.com/angular/angular/issues/44446
      const addEventListener = getOriginalDelegate(window.addEventListener);
      const removeEventListener = getOriginalDelegate(
        window.removeEventListener
      );
      return new Promise((resolve) => {
        const id = nextId++;
        const listener = (event: MessageEvent<Data>) => {
          if (
            (event.source === window,
            event.data.channel === channel &&
              event.data.id === id &&
              event.data.type === '@rxjs-insights/response')
          ) {
            resolve(event.data.message);
            removeEventListener.call(window, 'message', listener as any);
          }
        };
        addEventListener.call(window, 'message', listener as any);
        const data: Data = {
          type: '@rxjs-insights/request',
          channel,
          id,
          message,
        };
        window.postMessage(data, { targetOrigin: '*' });
      });
    },
  };
}

export function createPostMessageServerAdapter(
  channel: string
): ServerAdapterAsync {
  return {
    name: `ServerAdapterAsync[${channel}]`,
    startAsync(requestHandler) {
      // mitigates https://github.com/angular/angular/issues/44446
      const addEventListener = getOriginalDelegate(window.addEventListener);
      const removeEventListener = getOriginalDelegate(
        window.removeEventListener
      );
      const listener = (event: MessageEvent<Data>) => {
        if (
          event.source === window &&
          event.data.channel === channel &&
          event.data.type === '@rxjs-insights/request'
        ) {
          const result = requestHandler(event.data.message);
          const sendResponse = (responseMessage: ResponseMessage) => {
            const data: Data = {
              channel,
              id: event.data.id,
              type: '@rxjs-insights/response',
              message: responseMessage,
            };
            window.postMessage(data, { targetOrigin: '*' });
          };
          if (result instanceof Promise) {
            result.then(sendResponse);
          } else {
            sendResponse(result);
          }
        }
      };
      addEventListener.call(window, 'message', listener as any);
      return {
        stop() {
          removeEventListener.call(window, 'message', listener as any);
        },
      };
    },
  };
}
