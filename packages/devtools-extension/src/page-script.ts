import { createInspectedWindowEvalServerAdapter, startServer } from '@lib/rpc';
import {
  Instrumentation,
  InstrumentationChannel,
} from '@app/protocols/instrumentation-status';
import { Statistics, StatisticsChannel } from '@app/protocols/statistics';
import { getGlobalEnv } from '@rxjs-insights/core';

const RXJS_INSIGHTS_ENABLED_KEY = 'RXJS_INSIGHTS_ENABLED';

startServer<Statistics>(
  createInspectedWindowEvalServerAdapter(StatisticsChannel),
  {
    getStats() {
      return getGlobalEnv().getRecorderStats();
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
