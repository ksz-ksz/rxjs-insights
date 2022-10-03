import { RefOutletEntry } from '@app/components/get-ref-outlet-entries';
import { SidePanelEntry } from '@app/components/side-panel';
import {
  RefOutletActionEntryRenderer,
  RefOutletItemEntryRenderer,
} from '@app/components/ref-outlet';
import React from 'react';

export function getRefOutletSidePanelEntries(
  refOutletEntries: RefOutletEntry[]
) {
  return refOutletEntries.map(
    (entry): SidePanelEntry => ({
      key: entry.id,
      getHeight(): number {
        return 24;
      },
      render() {
        return 'action' in entry ? (
          <RefOutletActionEntryRenderer {...entry} />
        ) : (
          <RefOutletItemEntryRenderer
            indent={entry.indent}
            stateKey={entry.stateKey}
            path={entry.path}
            reference={entry.ref}
            expanded={entry.expanded}
            expandable={entry.expandable}
            label={entry.label}
            type={entry.type}
          />
        );
      },
    })
  );
}
