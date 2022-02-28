import { Locations, Locator } from '@rxjs-insights/instrumentation';

export class NoopLocator implements Locator {
  async locate(stackOffset: number): Promise<Locations> {
    return {};
  }
}
