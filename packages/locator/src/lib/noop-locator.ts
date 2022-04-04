import { Locations, Locator } from '@rxjs-insights/core';

export class NoopLocator implements Locator {
  async locate(stackOffset: number): Promise<Locations> {
    return {};
  }
}
