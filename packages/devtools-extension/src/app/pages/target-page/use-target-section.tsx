import { selectActiveTargetState } from '@app/selectors/active-target-state-selector';
import { selectRefsState } from '@app/selectors/refs-selectors';
import {
  getRefOutletEntries,
  RefOutletEntry,
} from '@app/components/get-ref-outlet-entries';
import { useLastDefinedValue } from '@app/utils';
import { getRefOutletSidePanelEntries } from '@app/components/get-ref-outlet-side-panel-entries';
import { useSuperSelector } from '@lib/state-fx/store-react';
import { createSuperSelector } from '../../../lib/state-fx/store/super-selector';

const selectVm = createSuperSelector(
  [selectActiveTargetState, selectRefsState],
  (context) => {
    const { relations } = selectActiveTargetState(context)!;
    const refs = selectRefsState(context);
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
  return useLastDefinedValue(useSuperSelector(selectVm), []);
}
