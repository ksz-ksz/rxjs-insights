import { Locations } from '@rxjs-insights/core';

export function getLocationStrings(locations: Locations) {
  const location = locations.originalLocation ?? locations.generatedLocation;
  if (location) {
    const { file, line, column } = location;
    const short = `${file.split('/').at(-1)}:${line}`;
    const long = `${file}:${line}:${column}`;
    return { location, short, long };
  } else {
    return undefined;
  }
}
