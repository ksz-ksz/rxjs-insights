import { useSelector } from '@app/store';
import { useRefsSection } from '@app/components/ref-outlet';
import { useMemo } from 'react';
import { createSelector } from '@lib/store';
import { activeTargetStateSelector } from '@app/selectors/active-target-state-selector';

const vmSelector = createSelector(
  [activeTargetStateSelector],
  ([activeTargetState]) => {
    const { relations } = activeTargetState!;
    const targets = Object.values(relations.targets);

    return {
      targets,
    };
  }
);

export function useTargetSection() {
  const vm = useSelector(vmSelector);

  return useRefsSection(
    useMemo(
      () =>
        vm.targets.map((target) => ({
          key: `target-${target.id}`,
          ref: target,
        })),
      [vm.targets]
    )
  );
}
