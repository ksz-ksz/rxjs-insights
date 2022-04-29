import React, { ReactNode } from 'react';
import { Box } from '@mui/material';

export function FullscreenCenter(props: { children: ReactNode }) {
  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems={'center'}
    >
      {props.children}
    </Box>
  );
}
