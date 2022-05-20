import { AppBar, Box, IconButton, Tab, Tabs, Toolbar } from '@mui/material';
import React from 'react';
import { createUrl, RouterLink, RouterOutlet } from '@lib/store-router';
import { router, routerSelectors } from '@app/store/router';
import { Close, Refresh } from '@mui/icons-material';
import { useDispatch, useSelector } from '@app/store';
import { appBarActions } from '@app/actions/app-bar-actions';
import { targetsSelector } from '@app/store/targets';

export function AppBarWrapper() {
  const dispatch = useDispatch();

  const targets = useSelector(targetsSelector).targets;

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
                value={`${target.type}/${target.id}`}
                to={createUrl([target.type, String(target.id)])}
                label={
                  <Box>
                    {target.name} #{target.id}
                    <IconButton
                      size="small"
                      edge="start"
                      aria-label="close"
                      sx={{ ml: 1 }}
                    >
                      <Close
                        fontSize="inherit"
                        onClick={(e) => {
                          dispatch(appBarActions.CloseTarget({ target }));
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
            onClick={() => dispatch(appBarActions.RefreshData())}
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
