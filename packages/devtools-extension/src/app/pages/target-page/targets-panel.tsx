import React from 'react';
import { RefOutlet } from '@app/components/ref-outlet';
import { createSelector } from '@lib/store';
import { activeTargetStateSelector } from '@app/selectors/active-target-state-selector';
import { useSelector } from '@app/store';
import { TargetsPanelDiv } from '@app/components/targets-panel-div';

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

export function TargetsPanel() {
  const vm = useSelector(vmSelector);

  return (
    <TargetsPanelDiv>
      {vm.targets.map((target) => (
        <RefOutlet reference={target} stateKey={`target-${target.id}`} />
      ))}
    </TargetsPanelDiv>
  );
}
