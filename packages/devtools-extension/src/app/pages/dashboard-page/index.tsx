import React, { useMemo } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useSelector } from '@app/store';
import { statisticsSelectors } from '@app/store/statisctics';
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

export function DashboardPage() {
  const stats = useSelector(statisticsSelectors.stats);

  return (
    <Box
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
    >
      <Box flex="1 1 0" display="flex" justifyContent="right">
        <Box maxWidth="600px">
          <Typography variant="h1">RxJS Insights</Typography>
          <Typography variant="h4">See through the observables</Typography>
        </Box>
      </Box>
      <Divider orientation="vertical" sx={{ mx: 2 }} variant="middle" />
      <Box flex="1 1 0" maxHeight="100%" overflow="auto">
        <Box maxWidth="600px" py={2}>
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
      </Box>
    </Box>
  );
}
