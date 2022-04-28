import { createInspectedWindowEvalServerAdapter, startServer } from '@lib/rpc';
import { TargetStatus } from '@app/protocols';

const RXJS_INSIGHTS_ENABLED_KEY = 'RXJS_INSIGHTS_ENABLED';

const enabled = sessionStorage.getItem(RXJS_INSIGHTS_ENABLED_KEY) === 'true';

startServer<TargetStatus>(createInspectedWindowEvalServerAdapter('target'), {
  isEnabled(): boolean {
    return enabled;
  },

  setEnabled(enabled: boolean) {
    sessionStorage.setItem(RXJS_INSIGHTS_ENABLED_KEY, JSON.stringify(enabled));
  },
});

(window as any)['RXJS_INSIGHTS_INSTALL'] = enabled;
