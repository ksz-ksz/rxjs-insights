export interface RequestMessage {
  func: string;
  args: any[];
}

export interface ResponseMessage {
  success?: any;
  failure?: any;
}

export interface ClientAdapter {
  name: string;
  send(message: RequestMessage): Promise<ResponseMessage>;
}

export type ServerAdapter = ServerAdapterSync | ServerAdapterAsync;

export interface RequestHandlerAsync {
  (message: RequestMessage): ResponseMessage | Promise<ResponseMessage>;
}

export interface ServerAdapterAsync {
  name: string;
  startAsync(requestHandler: RequestHandlerAsync): { stop(): void };
}

export interface RequestHandlerSync {
  (message: RequestMessage): ResponseMessage;
}

export interface ServerAdapterSync {
  name: string;
  startSync(requestHandler: RequestHandlerSync): { stop(): void };
}
