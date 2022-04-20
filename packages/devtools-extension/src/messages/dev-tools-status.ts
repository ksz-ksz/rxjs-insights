import { createMessage } from './message';

export namespace DevToolsStatus {
  export const IsActiveRequest = createMessage('IsActiveRequest');
  export const IsActiveResponse =
    createMessage<{ active: boolean }>('IsActiveResponse');
}
