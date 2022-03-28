import { Plugin, PluginBuild } from 'esbuild';
import {
  getConfig,
  RxjsInsightsPluginOptions,
} from '@rxjs-insights/plugin-base';

function setupAliases(aliases: Record<string, string>, build: PluginBuild) {
  const filter = new RegExp(`^(${Object.keys(aliases).join('|')})$`);
  build.onResolve({ filter }, ({ path, ...args }) =>
    build.resolve(aliases[path], args)
  );
}

function setupDefines(defines: Record<string, string>, build: PluginBuild) {
  build.initialOptions.define = { ...build.initialOptions.define, ...defines };
}

export function rxjsInsightsPlugin(
  options: RxjsInsightsPluginOptions = {}
): Plugin {
  const { name, aliases, defines } = getConfig(options);

  return {
    name,
    setup(build) {
      setupAliases(aliases, build);
      setupDefines(defines, build);
    },
  };
}
