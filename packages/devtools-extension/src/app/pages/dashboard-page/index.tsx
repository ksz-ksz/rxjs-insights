import React, { useMemo } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
  Table,
  TableContainer,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
  Paper,
  Stack,
} from '@mui/material';
import { FillCenter } from '@app/components';
import { useSelector } from '@app/store';
import {
  statistics,
  statisticsSelectors,
  StatisticsState,
} from '@app/store/statisctics';
import { createSelector } from '@lib/store';
import { ExpandMore } from '@mui/icons-material';

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
        <Typography sx={{ color: 'text.secondary' }}>{count}</Typography>
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

// export const vmSelector = createSelector((state: StatisticsState) => {
//   return {
//     observables: sortStats(state.stats?.observables),
//     observablesCount: countStats(state.stats?.observables),
//     subscribers: sortStats(state.stats?.subscribers),
//     subscribersCount: countStats(state.stats?.subscribers),
//     events: sortStats(state.stats?.events),
//     eventsCount: countStats(state.stats?.events),
//   };
// }, statistics);

export function DashboardPage() {
  const stats = useSelector(statisticsSelectors.stats);

  return (
    <FillCenter>
      <Stack
        sx={{
          width: '100%',
          maxWidth: '400px',
          overflow: 'auto',
          scrollbarGutter: 'stable',
        }}
      >
        <Typography variant="h4">
          Call the <code>inspect</code> function on <code>Observable</code> or{' '}
          <code>Subscriber</code> to see them in the devtools.
        </Typography>
        <Divider sx={{ my: 4 }} />
        <Box>
          <StatsLine
            label="Captured observables"
            stats={stats?.observables ?? {}}
          />
          <StatsLine
            label="Captured subscribers"
            stats={stats?.subscribers ?? {}}
          />
          <StatsLine label="Captured events" stats={stats?.events ?? {}} />
        </Box>
      </Stack>
    </FillCenter>
  );
}
