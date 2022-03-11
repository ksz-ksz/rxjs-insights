import { Location, Locator, Locations } from '@rxjs-insights/instrumentation';
import {
  getSourceMapConsumer,
  GREATEST_LOWER_BOUND,
  initSourceMapConsumer,
  LEAST_UPPER_BOUND,
} from './source-map';
import ErrorStackParser from 'error-stack-parser';

export class StacktraceLocator implements Locator {
  private readonly originalLocationsCache: Record<
    string,
    Promise<Location | undefined>
  > = {};

  constructor() {
    initSourceMapConsumer();
  }

  locate(stackOffset: number = 0): Promise<Locations> {
    const generatedLocation = this.getGeneratedLocation(stackOffset + 1);
    return this.getOriginalLocation(generatedLocation)
      .then((originalLocation) => {
        return {
          generatedLocation,
          originalLocation,
        };
      })
      .catch(() => {
        return { generatedLocation };
      });
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
  ): Promise<Location | undefined> {
    const cacheKey = `${generatedLocation?.file}:${generatedLocation?.line}:${generatedLocation?.column}`;
    try {
      if (generatedLocation === undefined) {
        return Promise.resolve(undefined);
      } else if (this.originalLocationsCache.hasOwnProperty(cacheKey)) {
        return this.originalLocationsCache[cacheKey];
      } else {
        const originalLocationPromise =
          this.resolveOriginalLocation(generatedLocation);
        this.originalLocationsCache[cacheKey] = originalLocationPromise;
        return originalLocationPromise;
      }
    } catch (e) {
      return Promise.reject();
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
