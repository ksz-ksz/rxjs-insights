import { InstrumentationContext } from './env';

export type PromiseOrValue<T> = Promise<T> | T;

export interface Location {
  file: string;
  line: number;
  column: number;
}

export interface Locations {
  originalLocation?: Location;
  generatedLocation?: Location;
}

export interface Locator {
  init?(context: InstrumentationContext): void;

  locate(stackOffset: number): PromiseOrValue<Locations>;
}
