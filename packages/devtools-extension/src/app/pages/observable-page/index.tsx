import React, { ReactNode } from 'react';
import { useSelector } from '@app/store';
import { observableInfo } from '@app/selectors/insights-selectors';
import { RefOutlet } from '@app/components/ref-outlet';
import { Scrollable } from '@app/components/scrollable';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';

function Row(props: { name: string; children: ReactNode }) {
  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell component="th" scope="row" sx={{ verticalAlign: 'top' }}>
        {props.name}
      </TableCell>
      <TableCell align="right">{props.children}</TableCell>
    </TableRow>
  );
}

export function ObservablePage() {
  const info = useSelector(observableInfo);
  if (info) {
    return (
      <Scrollable>
        <Container>
          <Typography variant="h1" sx={{ fontStyle: 'oblique' }}>
            {info.name}(
            {info.args.map((arg, index) => (
              <>
                {index !== 0 && ', '}
                <RefOutlet reference={arg} />
              </>
            ))}
            )
          </Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableBody>
                <Row name="ID">{info.id}</Row>
                <Row name="Name">{info.name}</Row>
                <Row name="Target">
                  <RefOutlet reference={info.target} />
                </Row>
                <Row name="Internal">{String(info.internal)}</Row>
                <Row name="Tags">{String(info.tags.join(', '))}</Row>
                <Row name="Calls">
                  <Table>
                    <TableBody>
                      <Row name="Next">{info.notifications.next}</Row>
                      <Row name="Error">{info.notifications.error}</Row>
                      <Row name="Complete">{info.notifications.complete}</Row>
                    </TableBody>
                  </Table>
                </Row>
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Scrollable>
    );
  } else {
    return null;
  }
}
