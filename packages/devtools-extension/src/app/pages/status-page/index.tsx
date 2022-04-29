import React from 'react';
import { FullscreenCenter } from '@app/components';
import { InstrumentationStatusCard } from './components/instrumentation-status-card';

export function StatusPage() {
  return (
    <FullscreenCenter>
      <InstrumentationStatusCard />
    </FullscreenCenter>
  );
}
