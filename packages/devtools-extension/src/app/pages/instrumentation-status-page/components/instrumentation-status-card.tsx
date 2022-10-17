import { useDispatch, useSelector } from '@app/store';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import React from 'react';
import { instrumentationStatusPageActions } from '@app/actions/instrumentation-status-page-actions';
import { statusSelector } from '@app/store/status';
import { REQUIRED_VERSION } from '../../../../required-version';

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
            It seems that the instrumentation was not installed. Make sure to
            set it up properly or wait a bit longer.
          </Typography>
          <Box>
            <Button
              target="_blank"
              href="https://github.com/ksz-ksz/rxjs-insights/blob/master/docs/devtools/setup.md"
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
    case 'not-compatible':
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          padding={2}
        >
          <Typography variant="body1" gutterBottom align="center">
            It seems that the installed instrumentation packages are not
            compatible with the extension. Update the packages to at least{' '}
            <code>{REQUIRED_VERSION}</code> and try again.
          </Typography>
          <Box>
            <Button
              target="_blank"
              href="https://www.npmjs.com/package/@rxjs-insights/core"
            >
              Check out the packages on NPM
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
              href="https://github.com/ksz-ksz/rxjs-insights/blob/master/docs/devtools/setup.md"
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
