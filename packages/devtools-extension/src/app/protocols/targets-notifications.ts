import { Target } from '@app/protocols/targets';

export const TargetsNotificationsChannel = 'TargetsNotificationsChannel';

export interface TargetsNotifications {
  notifyTarget(target: Target): void;
}
