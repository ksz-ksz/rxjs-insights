import { AppBar, Box, IconButton, Tab, Tabs, Toolbar } from '@mui/material';
import React, { useState } from 'react';
import { createUrl, RouterLink, RouterOutlet } from '@lib/store-router';
import { router, routerActions, routerSelectors } from '@app/store/router';
import { Close, Refresh } from '@mui/icons-material';
import { useDispatch, useSelector } from '@app/store';
import { appBarActions } from '@app/store/app-bar';
import { routesActions } from '@app/store/routes';

const TARGETS = [
  'Observable #1',
  'Observable #2',
  'Observable #3',
  'Observable #4',
  'Observable #5',
];

export function AppBarWrapper() {
  const dispatch = useDispatch();

  const [targets, setTargets] = useState(TARGETS);
  const url = useSelector(routerSelectors.url);
  const link = url.path.join('/');
  return (
    <Box display="flex" height="100%" flexDirection="column">
      <AppBar color="secondary" position="static" sx={{ flex: '0 0 0' }}>
        <Toolbar>
          <Tabs
            value={link}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="scrollable auto tabs example"
            sx={{ flexGrow: 1 }}
          >
            <Tab
              component={RouterLink}
              router={router}
              value="dashboard"
              to={createUrl(['dashboard'])}
              label="RxJS Insights"
            />
            {targets.map((target) => (
              <Tab
                component={RouterLink}
                router={router}
                value={`observable/${target}`}
                to={createUrl(['observable', target])}
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
                          dispatch(
                            routerActions.Navigate({
                              url: createUrl(['dashboard']),
                            })
                          );
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
            onClick={() => dispatch(appBarActions.RefreshDataButtonClicked())}
          >
            <Refresh />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box flex="1 1 0" overflow="hidden">
        <RouterOutlet router={router} />
      </Box>
    </Box>
  );
}
