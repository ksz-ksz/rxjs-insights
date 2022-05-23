import { createUrl, RouterLink } from '@lib/store-router';
import { router } from '@app/router';
import React from 'react';
import { useSelector } from '@app/store';
import { observableInfo } from '@app/selectors/insights-selectors';

export function ObservablePage() {
  const info = useSelector(observableInfo);
  return (
    <div>
      <span>Observable Page</span>
      <span>params:</span>
      <pre>
        <code>{JSON.stringify(info, null, 2)}</code>
      </pre>
      <RouterLink
        router={router}
        to={createUrl(['observable', 'Observable #2'])}
      >
        Observable #2
      </RouterLink>
    </div>
  );
}
