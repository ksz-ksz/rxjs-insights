import { selectActiveTargetState } from '@app/selectors/active-target-state-selector';
import { selectRefsState } from '@app/selectors/refs-selectors';
import {
  getRefOutletEntries,
  RefOutletEntry,
} from '@app/components/get-ref-outlet-entries';
import { useLastDefinedValue } from '@app/utils';
import { getRefOutletSidePanelEntries } from '@app/components/get-ref-outlet-side-panel-entries';
import { selectTime } from '@app/selectors/time-selectors';
import { useSuperSelector } from '@lib/state-fx/store-react';
import { createSuperSelector } from '../../../lib/state-fx/store/super-selector';

export const selectVm = createSuperSelector(
  [selectActiveTargetState, selectRefsState, selectTime],
  (context) => {
    const { target, relations } = selectActiveTargetState(context)!;
    const refs = selectRefsState(context);
    const time = selectTime(context);
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
  return useLastDefinedValue(useSuperSelector(selectVm), []);
}
