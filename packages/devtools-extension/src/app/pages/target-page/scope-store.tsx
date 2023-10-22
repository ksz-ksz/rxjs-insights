import { createStoreView } from '@lib/state-fx/store';
import { routerStore } from '@app/router';
import { refsStore } from '@app/store/refs/store';
import { insightsStore } from '@app/store/insights/store';

export const scopeStore = createStoreView({
  deps: [routerStore, refsStore, insightsStore],
});