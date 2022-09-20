import { getLocationStrings } from '@app/utils/get-location-strings';
import React, { MouseEvent, useCallback } from 'react';
import { Locations } from '@rxjs-insights/core';
import { styled } from '@mui/material';
import { openResourceAvailable } from '@app/features';

const LocationOutletSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  fontStyle: 'oblique',
  color: theme.inspector.secondary,
  textDecoration: openResourceAvailable ? 'underline' : undefined,
  cursor: openResourceAvailable ? 'pointer' : undefined,
}));

interface LocationOutletProps {
  locations: Locations;
}

export function LocationOutlet({ locations }: LocationOutletProps) {
  const strings = getLocationStrings(locations);

  const onOpen = useCallback(
    (event: MouseEvent) => {
      if (openResourceAvailable) {
        event.preventDefault();
        event.stopPropagation();
        if (strings?.location) {
          chrome.devtools.panels.openResource(
            strings.location.file,
            strings.location.line - 1,
            () => {}
          );
        }
      }
    },
    [strings?.location]
  );

  return strings ? (
    <LocationOutletSpan title={strings.long} onClick={onOpen}>
      {strings.short}
    </LocationOutletSpan>
  ) : null;
}
