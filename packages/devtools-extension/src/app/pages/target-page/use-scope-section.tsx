import { useSelector } from '@app/store';
import { useMemo } from 'react';
import { createSelector } from '@lib/store';
import { activeTargetStateSelector } from '@app/selectors/active-target-state-selector';
import { timeSelector } from '@app/selectors/insights-selectors';
import { useRefsSection } from '@app/components/use-refs-section';

export const vmSelector = createSelector(
  [activeTargetStateSelector, timeSelector],
  ([activeTargetState, time]) => {
    const { target, relations } = activeTargetState!;
    const event = relations.events[time];

    return {
      target,
      event,
    };
  }
);

export function useScopeSection() {
  const vm = useSelector(vmSelector);
  return useRefsSection(
    useMemo(
      () => [
        {
          key: 'context-target',
          ref: vm.target,
        },
        {
          key: 'context-event',
          ref: vm.event,
        },
      ],
      [vm.target, vm.event]
    )
  );
}
