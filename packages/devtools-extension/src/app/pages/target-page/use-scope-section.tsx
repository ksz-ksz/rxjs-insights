import { useSelector } from '@app/store';
import { createSelector } from '@lib/store';
import { activeTargetStateSelector } from '@app/selectors/active-target-state-selector';
import { timeSelector } from '@app/selectors/insights-selectors';
import { refsSelector } from '@app/selectors/refs-selectors';
import {
  getRefOutletEntries2,
  RefOutletEntry,
} from '@app/components/get-ref-outlet-entries';
import { useLastDefinedValue } from '@app/utils';
import { getRefOutletSidePanelEntries } from "@app/components/get-ref-outlet-side-panel-entries";

export const vmSelector = createSelector(
  [activeTargetStateSelector, refsSelector, timeSelector],
  ([activeTargetState, refs, time]) => {
    const { target, relations } = activeTargetState!;
    const event = relations.events[time];

    const refOutletEntries = [
      { ref: target, key: 'context-target' },
      { ref: event, key: 'context-event' },
    ].flatMap(({ ref, key }) => getRefOutletEntries2(ref, refs, key));

    if (refOutletEntries.find((entry) => entry === undefined)) {
      return undefined;
    }

    return getRefOutletSidePanelEntries(refOutletEntries as RefOutletEntry[]);
  }
);

export function useScopeSection() {
  return useLastDefinedValue(useSelector(vmSelector), []);
}
