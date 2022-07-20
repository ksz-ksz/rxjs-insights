import { Locations, Locator } from '@rxjs-insights/core';
import { PromiseOrValue } from '@rxjs-insights/core/src/lib/locator';

export class NoopLocator implements Locator {
  locate(stackOffset: number): PromiseOrValue<Locations> {
    return {};
  }
}
