import { createInspectedWindowEvalServerAdapter, startServer } from '@lib/rpc';
import {
  Instrumentation,
  InstrumentationChannel,
  InstrumentationStatus,
} from '@app/protocols/instrumentation-status';
import { Statistics, StatisticsChannel } from '@app/protocols/statistics';
import { Env, getGlobalEnv } from '@rxjs-insights/core';
import { Targets, TargetsChannel } from '@app/protocols/targets';
import { Insights, InsightsChannel } from '@app/protocols/insights';
import { Traces, TracesChannel } from '@app/protocols/traces';
import { Refs, RefsChannel } from '@app/protocols/refs';
import { RefsService } from './page-script/refs-service';
import { InsightsService } from './page-script/insights-service';
import { TargetsService } from './page-script/targets-service';
import { TracesService } from './page-script/traces-service';
import { createInspectFunction } from './page-script/inspect-function';

const REFS = 'RXJS_INSIGHTS_REFS';
const INSTALL = 'RXJS_INSIGHTS_INSTALL';
const CONNECT = 'RXJS_INSIGHTS_CONNECT';

// @ts-ignore
window[INSTALL] = sessionStorage.getItem(INSTALL) === 'true';

function getStatus(env: Env | null | undefined): InstrumentationStatus {
  if (env === undefined) {
    return 'not-installed';
  } else if (env === null) {
    return 'not-enabled';
  } else {
    return 'installed';
  }
}

function connect(env: Env | null | undefined) {
  const status = getStatus(env);

  startServer<Instrumentation>(
    createInspectedWindowEvalServerAdapter(InstrumentationChannel),
    {
      getStatus() {
        return status;
      },

      install() {
        sessionStorage.setItem(INSTALL, 'true');
        location.reload();
      },
    }
  );

  if (env) {
    const refs = new RefsService();
    const insights = new InsightsService(refs);
    const targets = new TargetsService(refs);
    const traces = new TracesService(refs);

    startServer<Refs>(
      createInspectedWindowEvalServerAdapter(RefsChannel),
      refs
    );

    startServer<Insights>(
      createInspectedWindowEvalServerAdapter(InsightsChannel),
      insights
    );

    startServer<Targets>(
      createInspectedWindowEvalServerAdapter(TargetsChannel),
      targets
    );

    startServer<Traces>(
      createInspectedWindowEvalServerAdapter(TracesChannel),
      traces
    );

    startServer<Statistics>(
      createInspectedWindowEvalServerAdapter(StatisticsChannel),
      {
        getStats() {
          return env.recorder.getStats();
        },
      }
    );

    // @ts-ignore
    window[REFS] = refs;

    return createInspectFunction(refs, targets);
  } else {
    switch (status) {
      case 'not-enabled':
        console.warn('RxJS Insights: Instrumentation in not installed.');
        break;
      case 'not-installed':
        console.warn('RxJS Insights: Instrumentation in not enabled.');
        break;
    }
    return undefined;
  }
}

// @ts-ignore
window[CONNECT] = connect;
