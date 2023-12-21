import { createMemoryHistory } from '@lib/state-fx/store-router';

const {
  testResourceKeys,
  testResourceActions,
  testResourceSelectors,
  testResourceConfigComponent,
} = createResource<TestQueries, TestMutations>({
  name: 'test',
});

container.provide(testResourceConfigComponent, createResourceConfigComponent());

const { actions, selectors, component, configComponent } = createRouter({
  name: 'router',
  history: createMemoryHistory(),
});
