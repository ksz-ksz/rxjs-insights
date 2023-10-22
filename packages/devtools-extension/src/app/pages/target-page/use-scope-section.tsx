import { activeTargetStateSelector } from '@app/selectors/active-target-state-selector';
import { refsSelector } from '@app/selectors/refs-selectors';
import {
  getRefOutletEntries,
  RefOutletEntry,
} from '@app/components/get-ref-outlet-entries';
import { useLastDefinedValue } from '@app/utils';
import { getRefOutletSidePanelEntries } from '@app/components/get-ref-outlet-side-panel-entries';
import { timeSelector } from '@app/selectors/time-selectors';
import { createSelector, SelectorContextFromDeps } from '@lib/state-fx/store';
import { useSelector } from '@lib/state-fx/store-react';
import { scopeStore } from '@app/pages/target-page/scope-store';

export const vmSelector = createSelector(
  (
    context: SelectorContextFromDeps<
      [
        typeof activeTargetStateSelector,
        typeof refsSelector,
        typeof timeSelector
      ]
    >
  ) => {
    const { target, relations } = activeTargetStateSelector(context)!;
    const refs = refsSelector(context);
    const time = timeSelector(context);
    const event = relations.events[time];

    const refOutletEntries = [
      { ref: target, key: 'context-target' },
      { ref: event, key: 'context-event' },
    ].flatMap(({ ref, key }) =>
      ref ? getRefOutletEntries(ref, refs, key) : []
    );

    if (refOutletEntries.some((entry) => entry === undefined)) {
      return undefined;
    }

    return getRefOutletSidePanelEntries(refOutletEntries as RefOutletEntry[]);
  }
);

export function useScopeSection() {
  return useLastDefinedValue(useSelector(scopeStore, vmSelector), []);
}
