import { useDispatch, useSelector } from '@app/store';
import { statusActions, statusSelectors } from '@app/store/status';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from '@mui/material';
import React from 'react';

export function InstrumentationStatusCard() {
  const dispatch = useDispatch();
  const status = useSelector(statusSelectors.instrumentationStatus);
  switch (status) {
    case undefined:
      return (
        <Card>
          <CardContent>
            <Typography variant="body1">Awaiting instrumentation...</Typography>
          </CardContent>
        </Card>
      );
    case 'not-installed':
      return (
        <Card>
          <CardContent>
            <Typography variant="body1">
              Instrumentation is not installed. Reload the page to install the
              instrumentation.
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              onClick={() =>
                dispatch(statusActions.InstallInstrumentationRequested())
              }
            >
              Reload page
            </Button>
          </CardActions>
        </Card>
      );
    case 'not-available':
      return (
        <Card>
          <CardContent>
            <Typography variant="body1">
              Instrumentation seems to be unavailable. Make sure that you set up
              the instrumentation properly or wait a bit longer.
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              target="_blank"
              href="https://github.com/ksz-ksz/rxjs-insights/blob/master/docs/instrumentation/index.md"
            >
              See documentation
            </Button>
            <Button
              onClick={() =>
                dispatch(statusActions.AwaitInstrumentationRequested())
              }
            >
              Wait
            </Button>
          </CardActions>
        </Card>
      );
    default:
      return null;
  }
}
