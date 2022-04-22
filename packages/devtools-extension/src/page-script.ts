import { createClient, createDocumentEventSender } from '@rpc';
import { Notifier } from '@rpc/protocols';

console.log('RxJS Insights page script');

class RxJSInsights {
  private readonly targets: any[] = [];

  inspect(target: any) {
    this.targets.push(target);
  }
}

(window as any)['__RXJS_INSIGHTS__'] = new RxJSInsights();

const notifierClient = createClient<Notifier>(
  createDocumentEventSender('notifier')
);

let i = 0;
setInterval(() => {
  console.time('t');
  notifierClient.ping(i++).then((x) => {
    console.timeEnd('t');
    console.log(x);
  });
}, 1000);
