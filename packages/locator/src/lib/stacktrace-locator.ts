import { Location, Locations, Locator } from '@rxjs-insights/core';
import {
  getSourceMapConsumer,
  GREATEST_LOWER_BOUND,
  initSourceMapConsumer,
  LEAST_UPPER_BOUND,
} from './source-map';
import ErrorStackParser from 'error-stack-parser';
import { PromiseOrValue } from '@rxjs-insights/core';

function isPromise<T>(x: PromiseOrValue<T>): x is Promise<T> {
  return Boolean(x) && 'then' in x && 'catch' in x;
}

export class StacktraceLocator implements Locator {
  private readonly originalLocationsCache: Record<
    string,
    Location | undefined
  > = {};

  constructor() {
    initSourceMapConsumer();
  }

  locate(stackOffset: number = 0): PromiseOrValue<Locations> {
    const generatedLocation = this.getGeneratedLocation(stackOffset + 1);
    const originalLocationPromiseOrValue =
      this.getOriginalLocation(generatedLocation);
    if (isPromise(originalLocationPromiseOrValue)) {
      return originalLocationPromiseOrValue.then((originalLocation) => {
        return {
          generatedLocation,
          originalLocation,
        };
      });
    } else {
      return {
        generatedLocation,
        originalLocation: originalLocationPromiseOrValue,
      };
    }
  }

  private getGeneratedLocation(stackOffset: number): Location | undefined {
    const stack = ErrorStackParser.parse(new Error());
    const frame = stack[stackOffset + 1];

    if (frame.fileName === undefined) {
      return undefined;
    } else {
      return {
        file: frame.fileName,
        line: frame.lineNumber ?? 0,
        column: frame.columnNumber ?? 0,
      };
    }
  }

  private getOriginalLocation(
    generatedLocation: Location | undefined
  ): PromiseOrValue<Location | undefined> {
    const cacheKey = `${generatedLocation?.file}:${generatedLocation?.line}:${generatedLocation?.column}`;
    try {
      if (generatedLocation === undefined) {
        return undefined;
      } else if (this.originalLocationsCache.hasOwnProperty(cacheKey)) {
        return this.originalLocationsCache[cacheKey];
      } else {
        return this.resolveOriginalLocation(generatedLocation)
          .then((originalLocation) => {
            this.originalLocationsCache[cacheKey] = originalLocation;
            return originalLocation;
          })
          .catch(() => undefined);
      }
    } catch (e) {
      return undefined;
    }
  }

  private async resolveOriginalLocation(
    generatedLocation: Location
  ): Promise<Location | undefined> {
    const consumer = await getSourceMapConsumer(generatedLocation.file);
    if (consumer === undefined) {
      return undefined;
    } else {
      const { line, column } = generatedLocation;

      const greatestLowerBound = consumer.originalPositionFor({
        line,
        column,
        bias: GREATEST_LOWER_BOUND,
      });
      if (greatestLowerBound.source !== null) {
        return {
          file: greatestLowerBound.source,
          line: greatestLowerBound.line ?? 0,
          column: greatestLowerBound.column ?? 0,
        };
      }

      const leastUpperBound = consumer.originalPositionFor({
        line,
        column,
        bias: LEAST_UPPER_BOUND,
      });
      if (leastUpperBound.source !== null) {
        return {
          file: leastUpperBound.source,
          line: leastUpperBound.line ?? 0,
          column: leastUpperBound.column ?? 0,
        };
      }

      return undefined;
    }
  }
}
