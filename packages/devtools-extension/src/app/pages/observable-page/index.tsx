import React from 'react';
import { useSelector } from '@app/store';
import { observableInfo } from '@app/selectors/insights-selectors';
import { RefOutlet } from '@app/components/ref-outlet';
import { Scrollable } from '@app/components/scrollable';

export function ObservablePage() {
  const info = useSelector(observableInfo);
  if (info) {
    console.log(info);
    return (
      <Scrollable>
        <RefOutlet label="target" type="enumerable" reference={info.target} />
      </Scrollable>
    );
  } else {
    return null;
  }
}
