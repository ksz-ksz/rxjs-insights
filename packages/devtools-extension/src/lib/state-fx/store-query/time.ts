import { Component, InitializedComponent } from '@lib/state-fx/store';

export interface Time {
  now(): number;
}

export const timeComponent: Component<Time> = {
  init(): InitializedComponent<Time> {
    return {
      component: {
        now(): number {
          return Date.now();
        },
      },
    };
  },
};
