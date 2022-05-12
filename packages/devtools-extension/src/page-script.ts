import { createInspectedWindowEvalServerAdapter, startServer } from '@lib/rpc';
import {
  Instrumentation,
  InstrumentationChannel,
} from '@app/protocols/instrumentation-status';
import {
  Statistics,
  StatisticsChannel,
  Stats,
} from '@app/protocols/statistics';

const RXJS_INSIGHTS_ENABLED_KEY = 'RXJS_INSIGHTS_ENABLED';

startServer<Statistics>(
  createInspectedWindowEvalServerAdapter(StatisticsChannel),
  {
    getStats(): Stats {
      return {
        observables: Math.floor(Math.random() * 100),
        subscribers: Math.floor(Math.random() * 100),
        notifications: Math.floor(Math.random() * 100),
      };
    },
  }
);

startServer<Instrumentation>(
  createInspectedWindowEvalServerAdapter(InstrumentationChannel),
  {
    getStatus() {
      switch ((window as any).RXJS_INSIGHTS_INSTALLED) {
        case true:
          return 'installed';
        case false:
          return 'not-installed';
        default:
          return 'not-available';
      }
    },

    install() {
      sessionStorage.setItem(RXJS_INSIGHTS_ENABLED_KEY, 'true');
      location.reload();
    },
  }
);

(window as any)['RXJS_INSIGHTS_INSTALL'] =
  sessionStorage.getItem(RXJS_INSIGHTS_ENABLED_KEY) === 'true';
