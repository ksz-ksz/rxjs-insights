import { styled } from '@mui/material';
import React, { ReactNode } from 'react';

const SidePanelDiv = styled('div')({
  display: 'flex',
  flexDirection: 'row',
});
const SidePanelContentDiv = styled('div')({
  display: 'flex',
  flexDirection: 'column',
});
const SidePanelResizerDiv = styled('div')(({ theme }) => ({
  width: '8px',
  borderLeft: `thin solid ${theme.palette.divider}`,
}));
const SidePanelSectionDiv = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  flexBasis: 0,
});
const SidePanelSectionHeaderDiv = styled('div')(({ theme }) => ({
  padding: '0 1rem',
  backgroundColor: theme.palette.divider,
  fontFamily: 'Monospace',
  fontWeight: 'bold',
}));
const SidePanelSectionBodyDiv = styled('div')({
  overflow: 'hidden',
});

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
  basis: number;
  children: ReactNode | ReactNode[];
}

export function SidePanelSection(props: SidePanelSectionProps) {
  return (
    <SidePanelSectionDiv
      sx={{ flexGrow: props.basis, flexShrink: props.basis }}
    >
      <SidePanelSectionHeaderDiv>{props.title}</SidePanelSectionHeaderDiv>
      <SidePanelSectionBodyDiv>{props.children}</SidePanelSectionBodyDiv>
    </SidePanelSectionDiv>
  );
}
