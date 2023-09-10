import { createMemoryHistory, createRouter } from '@lib/state-fx/store-router';

export const router = createRouter({
  namespace: 'router',
  history: createMemoryHistory(),
});
