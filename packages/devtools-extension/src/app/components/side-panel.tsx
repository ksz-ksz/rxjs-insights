import { styled } from '@mui/material';
import React, { ReactNode, useState } from 'react';
import { ChevronRight } from '@mui/icons-material';

const SidePanelDiv = styled('div')({
  display: 'flex',
  flexDirection: 'row',
});
const SidePanelContentDiv = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  overflow: 'auto',
});
const SidePanelResizerDiv = styled('div')(({ theme }) => ({
  width: '8px',
  borderLeft: `thin solid ${theme.palette.divider}`,
}));
const SidePanelSectionDiv = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  minWidth: '420px',
});
const SidePanelSectionHeaderDiv = styled('div')(({ theme }) => ({
  paddingRight: '1rem',
  backgroundColor: theme.custom.sidePanelHeaderBackground,
  fontFamily: 'Monospace',
  fontWeight: 'bold',
  display: 'flex',
  borderBottom: `thin solid ${theme.palette.background.default}`,
  cursor: 'pointer',
  position: 'sticky',
  top: 0,
  zIndex: 1,
}));
const SidePanelSectionBodyDiv = styled('div')({});

export interface SidePanelProps {
  children: ReactNode | ReactNode[];
}

export function SidePanel(props: SidePanelProps) {
  return (
    <SidePanelDiv>
      <SidePanelContentDiv>{props.children}</SidePanelContentDiv>
      <SidePanelResizerDiv />
    </SidePanelDiv>
  );
}

export interface SidePanelSectionProps {
  title: string;
  children: ReactNode | ReactNode[];
}

export function SidePanelSection(props: SidePanelSectionProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <SidePanelSectionDiv>
      <SidePanelSectionHeaderDiv onClick={() => setExpanded(!expanded)}>
        <ChevronRight
          style={{ transform: expanded ? 'rotate(90deg)' : 'none' }}
        />
        {props.title}
      </SidePanelSectionHeaderDiv>
      {expanded && (
        <SidePanelSectionBodyDiv>{props.children}</SidePanelSectionBodyDiv>
      )}
    </SidePanelSectionDiv>
  );
}
