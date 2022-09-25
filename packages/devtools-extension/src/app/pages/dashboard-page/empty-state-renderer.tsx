import React from 'react';
import { styled, Typography } from '@mui/material';

const EmptyStateDiv = styled('div')(({ theme }) => ({
  display: 'flex',
  textAlign: 'center',
  fontFamily: 'Monospace',
  fontStyle: 'oblique',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.disabled,
}));

export function EmptyStateRenderer({ text }: { text: string }) {
  return (
    <EmptyStateDiv>
      <Typography sx={{ px: '0.6rem' }} variant="body2">
        {text}
      </Typography>
    </EmptyStateDiv>
  );
}
