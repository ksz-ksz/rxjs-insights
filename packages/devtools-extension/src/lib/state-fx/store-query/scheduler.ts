import { Component, ComponentInstance } from '@lib/state-fx/store';
import { asyncScheduler, SchedulerLike } from 'rxjs';

export const schedulerComponent: Component<SchedulerLike> = {
  init(): ComponentInstance<SchedulerLike> {
    return {
      component: asyncScheduler,
    };
  },
};
