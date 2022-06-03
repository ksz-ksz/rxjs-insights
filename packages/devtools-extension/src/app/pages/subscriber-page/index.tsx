import React, { useEffect, useState } from 'react';
import { useSelector } from '@app/store';
import { subscriberRef } from '@app/selectors/insights-selectors';
import { RefOutlet } from '@app/components/ref-outlet';
import { Scrollable } from '@app/components/scrollable';
import { Container } from '@mui/material';
import { insightsClient } from '@app/clients/insights';

function Debug({ id }: { id: number }) {
  const [state, setState] = useState('');
  useEffect(() => {
    (async () => {
      const rels = await insightsClient.getSubscriberRelations(id);
      setState(JSON.stringify(rels, null, 2));
    })();
  }, [id]);

  return (
    <pre>
      <code>{state}</code>
    </pre>
  );
}

export function SubscriberPage() {
  const ref = useSelector(subscriberRef);
  if (ref) {
    return (
      <Scrollable>
        <Container>
          <RefOutlet reference={ref} />
          <Debug id={ref.id} />
        </Container>
      </Scrollable>
    );
  } else {
    return null;
  }
}
