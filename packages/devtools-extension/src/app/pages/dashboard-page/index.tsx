import React, { useMemo } from 'react';
import { Box, styled, Typography } from '@mui/material';
import { SidePanel } from '@app/components';
import { SidePanelSection } from '@app/components/side-panel';
import { usePinnedTargetsSection } from '@app/pages/dashboard-page/use-pinned-targets-section';
import { Logo } from '@app/components/logo/logo';

const TitleDiv = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '600px',
  background: `linear-gradient(to right, ${theme.insights.observable.secondary} 0%, ${theme.insights.subscriber.secondary} 100%)`,
  '-webkit-background-clip': 'text',
  '-webkit-text-fill-color': 'transparent',
}));

export function DashboardPage() {
  const pinnedTargetsSection = usePinnedTargetsSection();

  const panelSections = useMemo(
    (): SidePanelSection[] => [
      { label: 'PINNED TARGETS', entries: pinnedTargetsSection },
    ],
    [pinnedTargetsSection]
  );

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <Box
        sx={{
          flexGrow: '1',
          flexShrink: '1',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 2,
        }}
      >
        <TitleDiv>
          <Logo />
          <Typography align="center" variant="h1">
            RxJS Insights
          </Typography>
        </TitleDiv>
      </Box>
      <SidePanel side="right" sections={panelSections} />
    </Box>
  );
}
