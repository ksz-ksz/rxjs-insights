import { Message } from './message';

export class MessageEvent extends Event {
  static TYPE = 'RXJS_INSIGHTS_MESSAGE';
  constructor(readonly message: Message) {
    super(MessageEvent.TYPE);
  }
}
