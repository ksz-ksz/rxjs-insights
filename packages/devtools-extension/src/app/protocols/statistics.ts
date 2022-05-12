export const StatisticsChannel = 'StatisticsChannel';

export interface Statistics {
  getStats(): Stats;
}

export interface Stats {
  observables: number;
  subscribers: number;
  notifications: number;
}
