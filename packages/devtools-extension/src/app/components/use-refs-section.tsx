import { createSelector, StoreView } from '@lib/store';
import { SidePanelEntry } from '@app/components/side-panel';
import { useStore } from '@app/store';
import { Ref } from '@app/protocols/refs';
import {
  refStateSelector,
  refUiStateSelector,
} from '@app/selectors/refs-selectors';
import { getRefOutletEntries } from '@app/components/get-ref-outlet-entries';
import React, { useEffect, useRef, useState } from 'react';
import { asyncScheduler, debounceTime, throttleTime } from 'rxjs';
import { ActionOutletEntry, RefOutletEntry } from '@app/components/ref-outlet';

const vmSelector = (
  stateKey: string,
  ref: Ref,
  type?: 'enumerable' | 'nonenumerable' | 'special',
  label?: string
) =>
  createSelector(
    [refStateSelector(stateKey), refUiStateSelector(stateKey)],
    ([state, uiState]) => {
      return getRefOutletEntries(
        ref,
        stateKey,
        state,
        uiState,
        type,
        label
      )?.map(
        (entry): SidePanelEntry => ({
          key: entry.id,
          getHeight(): number {
            return 24;
          },
          render() {
            return 'action' in entry ? (
              <ActionOutletEntry key={entry.id} {...entry} />
            ) : (
              <RefOutletEntry
                key={entry.id}
                indent={entry.indent}
                stateKey={stateKey}
                path={entry.path}
                reference={entry.ref}
                expanded={entry.expanded}
                expandable={entry.expandable}
                label={entry.label}
                type={entry.type}
                summary={false}
              />
            );
          },
        })
      );
    }
  );

export interface RefEntryDef {
  key: string;
  ref: Ref;
  type?: 'enumerable' | 'nonenumerable' | 'special';
  label?: string;
}

class RefEntriesManager {
  private selections = new Map<
    string,
    StoreView<SidePanelEntry[] | undefined, void>
  >();
  private entries = new Map<string, SidePanelEntry[]>();

  constructor(
    private readonly store: ReturnType<typeof useStore>,
    private defs: RefEntryDef[]
  ) {
    for (const def of defs) {
      const selection = vmSelector(
        def.key,
        def.ref,
        def.type,
        def.label
      ).select(store, {
        mode: 'pull',
      });
      this.selections.set(def.key, selection);
      this.entries.set(def.key, selection.get() ?? []);
    }
  }

  update(defs: RefEntryDef[]) {
    const newSelections = new Map<
      string,
      StoreView<SidePanelEntry[] | undefined, void>
    >();
    const newEntries = new Map<string, SidePanelEntry[]>();

    for (const def of defs) {
      const selection =
        this.selections.get(def.key) ??
        vmSelector(def.key, def.ref, def.type, def.label).select(this.store, {
          mode: 'pull',
        });
      const entries = selection.get() ?? this.entries.get(def.key) ?? [];

      newSelections.set(def.key, selection);
      newEntries.set(def.key, entries);
    }

    this.defs = defs;
    this.selections = newSelections;
    this.entries = newEntries;
  }

  get(): SidePanelEntry[] {
    return this.defs.flatMap((def) => this.entries.get(def.key) ?? []);
  }
}

export function useRefsSection(defs: RefEntryDef[]): SidePanelEntry[] {
  const store = useStore();
  const manager = useRef(new RefEntriesManager(store, defs));
  const [entries, setEntries] = useState<SidePanelEntry[]>(() =>
    manager.current.get()
  );
  useEffect(
    function updateEntries() {
      const subscription = store.subscribe(() => {
        console.time('updateEntries');
        manager.current.update(defs);
        const entries = manager.current.get();
        setEntries(entries);
        console.timeEnd('updateEntries');
      });

      return () => subscription.unsubscribe();
    },
    [defs]
  );

  return entries;
}
