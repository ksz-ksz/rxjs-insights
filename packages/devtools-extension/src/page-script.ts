import { createInspectedWindowEvalServerAdapter, startServer } from '@lib/rpc';
import { TargetStatus, TargetStatusChannel } from '@app/protocols';

const RXJS_INSIGHTS_ENABLED_KEY = 'RXJS_INSIGHTS_ENABLED';

startServer<TargetStatus>(
  createInspectedWindowEvalServerAdapter(TargetStatusChannel),
  {
    getInstrumentationStatus() {
      switch ((window as any).RXJS_INSIGHTS_INSTALLED) {
        case true:
          return 'installed';
        case false:
          return 'not-installed';
        default:
          return 'not-available';
      }
    },

    reloadPageAndInstallInstrumentation() {
      sessionStorage.setItem(RXJS_INSIGHTS_ENABLED_KEY, 'true');
      location.reload();
    },
  }
);

(window as any)['RXJS_INSIGHTS_INSTALL'] =
  sessionStorage.getItem(RXJS_INSIGHTS_ENABLED_KEY) === 'true';
