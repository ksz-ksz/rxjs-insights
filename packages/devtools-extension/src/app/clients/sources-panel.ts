import { createChromeRuntimeClientAdapter, createClient } from '@lib/rpc';
import {
  FromSourcesPane,
  FromSourcesPaneChannel,
  ToSourcesPane,
  ToSourcesPaneChannel,
} from '@app/protocols/sources-panel';

export const fromSourcesPaneClient = createClient<FromSourcesPane>(
  createChromeRuntimeClientAdapter(FromSourcesPaneChannel)
);

export const toSourcesPaneClient = createClient<ToSourcesPane>(
  createChromeRuntimeClientAdapter(ToSourcesPaneChannel)
);
