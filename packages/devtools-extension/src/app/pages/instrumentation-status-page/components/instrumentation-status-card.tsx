import { useDispatch, useSelector } from '@app/store';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import React from 'react';
import { instrumentationStatusPageActions } from '@app/actions/instrumentation-status-page-actions';
import { statusSelector } from '@app/store/status';

export function InstrumentationStatusCard() {
  const dispatch = useDispatch();
  const status = useSelector(statusSelector);
  switch (status.instrumentationStatus) {
    case undefined:
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          padding={2}
        >
          <Typography variant="body1" gutterBottom align="center">
            Awaiting instrumentation...
          </Typography>
          <CircularProgress />
        </Box>
      );
    case 'not-installed':
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          padding={2}
        >
          <Typography variant="body1" gutterBottom align="center">
            Instrumentation is not installed. Reload the page to install the
            instrumentation.
          </Typography>
          <Button
            onClick={() =>
              dispatch(
                instrumentationStatusPageActions.ReloadPageButtonClicked()
              )
            }
          >
            Reload page
          </Button>
        </Box>
      );
    case 'not-available':
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          padding={2}
        >
          <Typography variant="body1" gutterBottom align="center">
            Instrumentation seems to be unavailable. Make sure that you set up
            the instrumentation properly or wait a bit longer.
          </Typography>
          <Box>
            <Button
              target="_blank"
              href="https://github.com/ksz-ksz/rxjs-insights/blob/master/docs/instrumentation/index.md"
            >
              See documentation
            </Button>
            <Button
              onClick={() =>
                dispatch(
                  instrumentationStatusPageActions.WaitForInstrumentationButtonClicked()
                )
              }
            >
              Wait
            </Button>
          </Box>
        </Box>
      );
    default:
      return null;
  }
}
