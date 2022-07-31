import {
  createClient,
  createDocumentEventClientAdapter,
  createInspectedWindowEvalServerAdapter,
  startServer,
} from '@lib/rpc';
import {
  Instrumentation,
  InstrumentationChannel,
} from '@app/protocols/instrumentation-status';
import { Statistics, StatisticsChannel } from '@app/protocols/statistics';
import {
  getGlobalEnv,
  ObservableLike,
  SubscriberLike,
} from '@rxjs-insights/core';
import { Targets, TargetsChannel } from '@app/protocols/targets';
import {
  TargetsNotifications,
  TargetsNotificationsChannel,
} from '@app/protocols/targets-notifications';
import { Insights, InsightsChannel } from '@app/protocols/insights';
import { Traces, TracesChannel } from '@app/protocols/traces';
import { Refs, RefsChannel, TargetRef } from '@app/protocols/refs';
import {
  getObservable,
  getSubscriber,
  isObservableTarget,
  isSubscriberTarget,
} from '@rxjs-insights/recorder-utils';
import { RefsService } from './page-script/refs-service';
import { InsightsService } from './page-script/insights-service';
import { TargetsService } from './page-script/targets-service';
import { TracesService } from './page-script/traces-service';

const RXJS_INSIGHTS_ENABLED_KEY = 'RXJS_INSIGHTS_ENABLED';

startServer<Statistics>(
  createInspectedWindowEvalServerAdapter(StatisticsChannel),
  {
    getStats() {
      return getGlobalEnv().recorder.getStats();
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

const targetsNotificationsClient = createClient<TargetsNotifications>(
  createDocumentEventClientAdapter(TargetsNotificationsChannel)
);

const refs = new RefsService();
const insights = new InsightsService(refs);
const targets = new TargetsService(refs);
const traces = new TracesService(refs);

startServer<Refs>(createInspectedWindowEvalServerAdapter(RefsChannel), refs);

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

(window as any).REFS = refs;

function getTarget(maybeTarget: ObservableLike | SubscriberLike) {
  if (isSubscriberTarget(maybeTarget)) {
    return getSubscriber(maybeTarget);
  }
  if (isObservableTarget(maybeTarget)) {
    return getObservable(maybeTarget);
  }
  return undefined;
}

function inspect(maybeTarget: ObservableLike | SubscriberLike) {
  const target = getTarget(maybeTarget);
  if (target) {
    const targetRef = refs.create(target) as TargetRef;
    targets.pinTarget(targetRef.objectId);
    void targetsNotificationsClient.notifyTarget(targetRef);
  }
}

(window as any).RXJS_ISNIGHTS_DEVTOOLS_INSPECT = inspect;

(window as any)['RXJS_INSIGHTS_INSTALL'] =
  sessionStorage.getItem(RXJS_INSIGHTS_ENABLED_KEY) === 'true';
