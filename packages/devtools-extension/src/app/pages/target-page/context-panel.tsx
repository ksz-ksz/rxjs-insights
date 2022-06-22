import React from 'react';
import { styled } from '@mui/material';
import { RefOutlet } from '@app/components/ref-outlet';
import { createSelector } from '@lib/store';
import { activeTargetStateSelector } from '@app/selectors/active-target-state-selector';
import { timeSelector } from '@app/selectors/insights-selectors';
import { useSelector } from '@app/store';

const ContextPanelDiv = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  whiteSpace: 'nowrap',
  paddingRight: '1rem',
  cursor: 'default',
});

const vmSelector = createSelector(
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

export function ContextPanel() {
  const vm = useSelector(vmSelector);

  return (
    <ContextPanelDiv>
      <RefOutlet label="target" reference={vm.target} />
      {vm.event && <RefOutlet label="event" reference={vm.event} />}
    </ContextPanelDiv>
  );
}
