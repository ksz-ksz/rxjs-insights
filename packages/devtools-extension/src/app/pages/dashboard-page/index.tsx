import React, { useMemo } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useSelector } from '@app/store';
import { statisticsSelector } from '@app/store/statisctics';
import { ExpandMore } from '@mui/icons-material';
import { targetsSelector } from '@app/selectors/targets-selectors';
import { SidePanel, SidePanelSection } from '@app/components';
import { ContextPanel } from '@app/pages/target-page/context-panel';
import { TargetsPanel } from '@app/pages/target-page/targets-panel';
import { PinnedTargetsPanel } from '@app/pages/dashboard-page/pinned-targets-panel';

export interface StatsLineProps {
  label: string;
  stats: Record<string, number>;
}

function sortStats(stats: Record<string, number> = {}) {
  return Object.entries(stats).sort(([, a], [, b]) => b - a);
}

function countStats(stats: Record<string, number> = {}) {
  return Object.values(stats).reduce((acc, x) => acc + x, 0);
}

export function StatsLine({ label, stats }: StatsLineProps) {
  const count = useMemo(() => countStats(stats), [stats]);
  const sortedStats = useMemo(() => sortStats(stats), [stats]);

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography sx={{ width: '33%', flexShrink: 0 }}>{label}</Typography>
        <Typography sx={{ color: 'text.secondary', marginLeft: 2 }}>
          {count}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Count</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedStats.map(([name, count]) => (
                <TableRow
                  key={name}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {name}
                  </TableCell>
                  <TableCell align="right">{count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
}

const TitleDiv = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '600px',
  background: `linear-gradient(to right, ${theme.insights.observable.secondary} 0%, ${theme.insights.subscriber.secondary} 100%)`,
  '-webkit-background-clip': 'text',
  '-webkit-text-fill-color': 'transparent',
}));

export function DashboardPage() {
  const statistics = useSelector(statisticsSelector);

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
          <Typography variant="h1">RxJS Insights</Typography>
          <Typography variant="h4">See through the observables</Typography>
        </TitleDiv>
      </Box>
      <SidePanel side="right">
        <SidePanelSection title="PINNED TARGETS">
          <PinnedTargetsPanel />
        </SidePanelSection>
        {/*<SidePanelSection title="RECENT TARGETS">*/}
        {/*  <TargetsPanel />*/}
        {/*</SidePanelSection>*/}
      </SidePanel>
    </Box>
  );
}
