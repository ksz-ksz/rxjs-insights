import { useSelector } from '@app/store';
import { createSelector } from '@lib/store';
import { activeTargetStateSelector } from '@app/selectors/active-target-state-selector';
import { refsSelector } from '@app/selectors/refs-selectors';
import {
  getRefOutletEntries2,
  RefOutletEntry,
} from '@app/components/get-ref-outlet-entries';
import { useLastDefinedValue } from '@app/utils';
import { getRefOutletSidePanelEntries } from "@app/components/get-ref-outlet-side-panel-entries";

const vmSelector = createSelector(
  [activeTargetStateSelector, refsSelector],
  ([activeTargetState, refs]) => {
    const { relations } = activeTargetState!;
    const targets = Object.values(relations.targets);

    const refOutletEntries = targets.flatMap((target) =>
      getRefOutletEntries2(target, refs, `target-${target.id}`)
    );

    if (refOutletEntries.find((entry) => entry === undefined)) {
      return undefined;
    }

    return getRefOutletSidePanelEntries(refOutletEntries as RefOutletEntry[]);
  }
);

export function useTargetSection() {
  return useLastDefinedValue(useSelector(vmSelector), []);
}
