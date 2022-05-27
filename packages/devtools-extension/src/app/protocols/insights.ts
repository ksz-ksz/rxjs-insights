import { Locations } from '@rxjs-insights/core';
import { Ref } from '@app/protocols/refs';

export const InsightsChannel = 'InsightsChannel';

export interface NotificationsStats {
  next: number;
  error: number;
  complete: number;
}

export interface SubscriptionsStats {
  active: number;
  errored: number;
  completed: number;
  unsubscribed: number;
}

export interface ObservableInfo {
  id: number;
  name: string;
  target: Ref;
  internal: boolean;
  tags: string[];
  notifications: NotificationsStats;
  subscriptions: SubscriptionsStats;
  locations?: Locations;
  ctor: Ref;
  args: Ref[];
  source: Ref;
}

export interface Insights {
  getObservableInfo(observableId: number): ObservableInfo | undefined;
}
