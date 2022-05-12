import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import { FillCenter } from '@app/components';
import { useSelector } from '@app/store';
import { statisticsSelectors } from '@app/store/statisctics';

export interface StatsLineProps {
  label: string;
  count: number;
}
export function StatsLine({ label, count }: StatsLineProps) {
  return (
    <Box sx={{ my: 3, mx: 2 }}>
      <Grid container alignItems="center" spacing={4}>
        <Grid item xs>
          <Typography gutterBottom variant="h6" component="div">
            {label}
          </Typography>
        </Grid>
        <Grid item>
          <Typography gutterBottom variant="h6" component="div">
            {count}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

export function DashboardPage() {
  const stats = useSelector(statisticsSelectors.stats);

  return (
    <FillCenter>
      <Card sx={{ width: '600px' }}>
        <CardContent>
          <StatsLine
            label="Captured observables"
            count={stats?.observables ?? 0}
          />
          <Divider variant="middle" />
          <StatsLine
            label="Captured subscribers"
            count={stats?.subscribers ?? 0}
          />
          <Divider variant="middle" />
          <StatsLine
            label="Captured notifications"
            count={stats?.notifications ?? 0}
          />
        </CardContent>
      </Card>
    </FillCenter>
  );
}
