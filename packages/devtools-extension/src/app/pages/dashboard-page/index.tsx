import React, { useMemo } from 'react';
import { Box, styled, Typography } from '@mui/material';
import { SidePanel } from '@app/components';
import { SidePanelSection } from '@app/components/side-panel';
import { usePinnedTargetsSection } from '@app/pages/dashboard-page/use-pinned-targets-section';
import { Logo } from '@app/components/logo/logo';
import { useTraceSection } from '@app/pages/dashboard-page/use-trace-section';
import { useSidePanelWidth } from '@app/utils';

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
  const traceSection = useTraceSection();

  const panelSections = useMemo(
    (): SidePanelSection[] => [
      { label: 'TARGETS', entries: pinnedTargetsSection },
      { label: 'TRACE', entries: traceSection },
    ],
    [pinnedTargetsSection, traceSection]
  );

  const panelWidth = useSidePanelWidth(
    400,
    'ui:dashboard-page:side-panel:right:width'
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
      <SidePanel side="right" sections={panelSections} {...panelWidth} />
    </Box>
  );
}
