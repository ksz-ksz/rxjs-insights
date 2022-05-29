import React, { ReactNode } from 'react';
import { Box } from '@mui/material';

export function Scrollable(props: { children: ReactNode }) {
  return (
    <Box width="100%" height="100%" overflow="auto">
      {props.children}
    </Box>
  );
}
