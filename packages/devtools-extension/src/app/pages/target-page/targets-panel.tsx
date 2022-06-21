import React from 'react';
import { styled } from '@mui/material';
import { RefOutlet } from '@app/components/ref-outlet';
import { createSelector } from '@lib/store';
import { activeTargetStateSelector } from '@app/selectors/active-target-state-selector';
import { timeSelector } from '@app/selectors/insights-selectors';
import { useSelector } from '@app/store';

const TargetsPanelDiv = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'auto',
  whiteSpace: 'nowrap',
  paddingRight: '1rem',
  cursor: 'default',
});

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
        <RefOutlet reference={target} />
      ))}
    </TargetsPanelDiv>
  );
}
