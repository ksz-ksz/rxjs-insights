import { Plugin, PluginBuild } from 'esbuild';
import {
  getConfig,
  RxjsInsightsPluginOptions,
} from '@rxjs-insights/plugin-base';

function setupAliases(aliases: Record<string, string>, build: PluginBuild) {
  const filter = new RegExp(`^(${Object.keys(aliases).join('|')})$`);
  build.onResolve({ filter }, ({ path, ...args }) =>
    build.resolveData(aliases[path], args)
  );
}

export function rxjsInsightsPlugin(
  options: RxjsInsightsPluginOptions = {}
): Plugin {
  const { name, aliases } = getConfig(options);

  return {
    name,
    setup(build) {
      setupAliases(aliases, build);
    },
  };
}
