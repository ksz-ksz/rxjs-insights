import { useSelector } from '@app/store';
import { old_createSelector } from '@lib/store';
import { activeTargetStateSelector } from '@app/selectors/active-target-state-selector';
import { refsSelector } from '@app/selectors/refs-selectors';
import {
  getRefOutletEntries,
  RefOutletEntry,
} from '@app/components/get-ref-outlet-entries';
import { useLastDefinedValue } from '@app/utils';
import { getRefOutletSidePanelEntries } from '@app/components/get-ref-outlet-side-panel-entries';
import { timeSelector } from '@app/selectors/time-selectors';

export const vmSelector = old_createSelector(
  [activeTargetStateSelector, refsSelector, timeSelector],
  ([activeTargetState, refs, time]) => {
    const { target, relations } = activeTargetState!;
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
  return useLastDefinedValue(useSelector(vmSelector), []);
}
