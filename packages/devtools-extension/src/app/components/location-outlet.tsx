import { getLocationStrings } from '@app/utils/get-location-strings';
import React, { MouseEvent, useCallback } from 'react';
import { Locations } from '@rxjs-insights/core';
import { styled } from '@mui/material';

const LocationOutletSpan = styled('span')(({ theme }) => ({
  fontFamily: 'Monospace',
  fontStyle: 'oblique',
  textDecoration: 'underline',
  cursor: 'pointer',
  color: theme.inspector.secondary,
}));

interface LocationOutletProps {
  locations: Locations;
}

export function LocationOutlet({ locations }: LocationOutletProps) {
  const strings = getLocationStrings(locations);

  const onOpen = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (strings?.location) {
        chrome.devtools.panels.openResource(
          strings.location.file,
          strings.location.line - 1,
          () => {}
        );
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
