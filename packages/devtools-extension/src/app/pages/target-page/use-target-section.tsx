import { activeTargetStateSelector } from '@app/selectors/active-target-state-selector';
import { refsSelector } from '@app/selectors/refs-selectors';
import {
  getRefOutletEntries,
  RefOutletEntry,
} from '@app/components/get-ref-outlet-entries';
import { useLastDefinedValue } from '@app/utils';
import { getRefOutletSidePanelEntries } from '@app/components/get-ref-outlet-side-panel-entries';
import { createSelector, SelectorContextFromDeps } from '@lib/state-fx/store';
import { useSelector } from '@lib/state-fx/store-react';
import { scopeStore } from '@app/pages/target-page/scope-store';

const vmSelector = createSelector(
  (
    context: SelectorContextFromDeps<
      [typeof activeTargetStateSelector, typeof refsSelector]
    >
  ) => {
    const { relations } = activeTargetStateSelector(context)!;
    const refs = refsSelector(context);
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
  return useLastDefinedValue(useSelector(scopeStore, vmSelector), []);
}
