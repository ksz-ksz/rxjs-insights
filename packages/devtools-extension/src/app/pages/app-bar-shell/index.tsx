import { AppBar, Box, IconButton, Tab, Tabs, Toolbar } from '@mui/material';
import React, { useState } from 'react';
import { RouterOutlet } from '@lib/store-router';
import { router } from '@app/store/router';
import { Close, Refresh } from '@mui/icons-material';

const TARGETS = [
  'Observable #1',
  'Observable #2',
  'Observable #3',
  'Observable #4',
  'Observable #5',
  'Observable #6',
  'Observable #7',
  'Observable #8',
  'Observable #9',
  'Observable #10',
  'Observable #11',
  'Observable #12',
  'Observable #13',
  'Observable #14',
  'Observable #15',
  'Observable #16',
  'Observable #17',
  'Observable #18',
  'Observable #19',
  'Observable #20',
  'Subscriber #1',
  'Subscriber #2',
  'Subscriber #3',
  'Subscriber #4',
  'Subscriber #5',
  'Subscriber #6',
  'Subscriber #7',
  'Subscriber #8',
  'Subscriber #9',
  'Subscriber #10',
  'Subscriber #11',
  'Subscriber #12',
  'Subscriber #13',
  'Subscriber #14',
  'Subscriber #15',
  'Subscriber #16',
  'Subscriber #17',
  'Subscriber #18',
  'Subscriber #19',
  'Subscriber #20',
].sort(() => (Math.random() > 0.5 ? -1 : 1));

export function AppBarShell() {
  const [targets, setTargets] = useState(TARGETS);
  const [value, setValue] = useState<string>();
  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };
  return (
    <Box display="flex" height="100%" flexDirection="column">
      <AppBar color="secondary" position="static" sx={{ flex: '0 0 0' }}>
        <Toolbar>
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="scrollable auto tabs example"
            sx={{ flexGrow: 1 }}
          >
            {targets.map((target) => (
              <Tab
                value={target}
                label={
                  <Box>
                    {target}
                    <IconButton
                      size="small"
                      edge="start"
                      aria-label="close"
                      sx={{ ml: 1 }}
                    >
                      <Close
                        fontSize="inherit"
                        onClick={(e) => {
                          const indexToRemove = targets.indexOf(target);
                          setTargets([
                            ...targets.slice(0, indexToRemove),
                            ...targets.slice(indexToRemove + 1),
                          ]);
                          setValue(targets[indexToRemove + 1]);
                          e.stopPropagation();
                        }}
                      />
                    </IconButton>
                  </Box>
                }
              />
            ))}
          </Tabs>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="refresh"
          >
            <Refresh />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box flex="1 1 0">
        <RouterOutlet router={router} />
      </Box>
    </Box>
  );
}
