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
    case 'not-enabled':
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          padding={2}
        >
          <Typography variant="body1" gutterBottom align="center">
            Instrumentation is not enabled. Reload the page to enable the
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
    case 'not-installed':
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          padding={2}
        >
          <Typography variant="body1" gutterBottom align="center">
            It seems that the instrumentation was not installed. Make sure to
            set it up properly or wait a bit longer.
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
    case 'not-connected':
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          padding={2}
        >
          <Typography variant="body1" gutterBottom align="center">
            It seems that the inspected window did not connect to the devtools.
            Make sure to connect properly or wait a bit longer.
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
