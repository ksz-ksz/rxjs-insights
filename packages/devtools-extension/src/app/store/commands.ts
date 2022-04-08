import { createCommand } from '../store-lib';

export const SetTargetStatus =
  createCommand<{ targetStatus: 'connected' | 'disconnected' }>(
    'SetTargetStatus'
  );
