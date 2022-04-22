export interface RequestMessage {
  func: string;
  args: any[];
}

export interface ResponseMessage {
  success?: any;
  failure?: any;
}

export type MessageListener = (
  message: RequestMessage,
  sendResponseMessage: (message: ResponseMessage) => void
) => void;

export interface Sender {
  sendMessage(
    message: RequestMessage,
    responseMessageHandler: (message: ResponseMessage) => void
  ): void;
}

export interface Receiver {
  addMessageListener(messageListener: MessageListener): {
    removeMessageListener(): void;
  };
}
