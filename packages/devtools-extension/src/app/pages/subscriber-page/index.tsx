import React, { useEffect, useState } from 'react';
import { useSelector } from '@app/store';
import { subscriberState } from '@app/selectors/insights-selectors';
import { RefOutlet } from '@app/components/ref-outlet';
import { Scrollable } from '@app/components/scrollable';
import { Container } from '@mui/material';
import { insightsClient } from '@app/clients/insights';

export function SubscriberPage() {
  const state = useSelector(subscriberState);
  const ref = state?.ref;
  if (ref) {
    return (
      <Scrollable>
        <Container>
          <RefOutlet reference={ref} />
          <pre>
            <code>{JSON.stringify(state?.relations, null, 2)}</code>
          </pre>
        </Container>
      </Scrollable>
    );
  } else {
    return null;
  }
}
