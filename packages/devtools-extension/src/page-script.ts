import { createInspectedWindowEvalServerAdapter, startServer } from '@rpc';
import { Notifier } from '@rpc/protocols';

console.log('RxJS Insights page script');

class RxJSInsights {
  private readonly targets: any[] = [];

  inspect(target: any) {
    this.targets.push(target);
  }
}

(window as any)['__RXJS_INSIGHTS__'] = new RxJSInsights();

startServer<Notifier>(createInspectedWindowEvalServerAdapter('page'), {
  ping(id: number): string {
    return JSON.stringify(new Array(100000).fill(id));
  },
});
