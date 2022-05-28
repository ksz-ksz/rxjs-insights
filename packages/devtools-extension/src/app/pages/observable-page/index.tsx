import React from 'react';
import { useSelector } from '@app/store';
import { observableInfo } from '@app/selectors/insights-selectors';
import { RefOutlet } from '@app/components/ref-outlet';

export function ObservablePage() {
  const info = useSelector(observableInfo);
  if (info) {
    console.log(info);
    return (
      <div>
        <RefOutlet label="target" type="enumerable" reference={info.target} />
      </div>
    );
  } else {
    return null;
  }
}
