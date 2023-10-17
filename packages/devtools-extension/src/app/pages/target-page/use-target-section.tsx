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

const vmSelector = old_createSelector(
  [activeTargetStateSelector, refsSelector],
  ([activeTargetState, refs]) => {
    const { relations } = activeTargetState!;
    const targets = Object.values(relations.targets);

    const refOutletEntries = targets.flatMap((target) =>
      getRefOutletEntries(target, refs, `target-${target.id}`)
    );

    if (refOutletEntries.some((entry) => entry === undefined)) {
      return undefined;
    }

    return getRefOutletSidePanelEntries(refOutletEntries as RefOutletEntry[]);
  }
);

export function useTargetSection() {
  return useLastDefinedValue(useSelector(vmSelector), []);
}
