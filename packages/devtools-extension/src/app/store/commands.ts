import { createCommand } from '@lib/store';

export const SetTargetStatus =
  createCommand<{ targetStatus: 'connected' | 'disconnected' }>(
    'SetTargetStatus'
  );
