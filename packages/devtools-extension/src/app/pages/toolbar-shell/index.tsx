import { Box, Toolbar } from '@mui/material';
import React from 'react';
import { RouterOutlet } from '@lib/store-router';
import { router } from '@app/store/router';

export function ToolbarShell() {
  return (
    <Box>
      <Toolbar>asd</Toolbar>
      <RouterOutlet router={router} />
    </Box>
  );
}
