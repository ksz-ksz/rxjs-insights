import { Component, InitializedComponent } from '@lib/state-fx/store';
import { asyncScheduler, SchedulerLike } from 'rxjs';

export const schedulerComponent: Component<SchedulerLike> = {
  init(): InitializedComponent<SchedulerLike> {
    return {
      component: asyncScheduler,
    };
  },
};
