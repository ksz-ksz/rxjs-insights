import {
  ClientAdapter,
  RequestMessage,
  ResponseMessage,
  ServerAdapterSync,
} from './message';

export function createInspectedWindowEvalClientAdapter(
  channel: string
): ClientAdapter {
  return {
    name: `ClientAdapter[${channel}]`,
    send(message: RequestMessage) {
      return new Promise((resolve) => {
        chrome.devtools.inspectedWindow.eval(
          `window["__eval__${channel}"](${JSON.stringify(message)})`,
          (result: ResponseMessage, exceptionInfo) => {
            if (exceptionInfo && exceptionInfo.isError) {
              resolve({ failure: exceptionInfo.description });
            } else if (exceptionInfo && exceptionInfo.isException) {
              resolve({ failure: exceptionInfo.value });
            } else {
              resolve(result);
            }
          }
        );
      });
    },
  };
}

export function createInspectedWindowEvalServerAdapter(
  channel: string
): ServerAdapterSync {
  return {
    name: `ServerAdapterAsync[${channel}]`,
    startSync(requestHandler) {
      (window as any)['__eval__' + channel] = (message: RequestMessage) => {
        return requestHandler(message);
      };

      return {
        stop() {
          delete (window as any)['__eval__' + channel];
        },
      };
    },
  };
}
