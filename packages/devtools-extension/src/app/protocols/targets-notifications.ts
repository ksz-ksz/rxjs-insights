import { TargetRef } from '@app/protocols/refs';

export const TargetsNotificationsChannel = 'TargetsNotificationsChannel';

export interface TargetsNotifications {
  notifyTarget(target: TargetRef): void;
}
