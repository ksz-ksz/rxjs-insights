import { Compiler } from 'webpack';
import {
  getConfig,
  RxjsInsightsPluginOptions,
} from '@rxjs-insights/plugin-base';

type ResolverAlias = Alias[] | Record<string, string | false | string[]>;

type Alias = {
  name: string;
  alias: string | false | string[];
  onlyModule?: boolean;
};

function normalizeResolverAlias(alias: ResolverAlias): Alias[] {
  return typeof alias === 'object' && !Array.isArray(alias) && alias !== null
    ? Object.keys(alias).map((key) => {
        const obj = { name: key, onlyModule: false, alias: alias[key] };

        if (/\$$/.test(key)) {
          obj.onlyModule = true;
          obj.name = key.substr(0, key.length - 1);
        }

        return obj;
      })
    : alias || [];
}

function getAliases(aliases: Record<string, string>): Alias[] {
  return Object.entries(aliases).map(([name, alias]) => ({
    name,
    alias,
    onlyModule: true,
  }));
}

function applyAliases(
  name: string,
  aliases: Record<string, string>,
  compiler: Compiler
) {
  compiler.hooks.afterResolvers.tap(name, (compiler: any) => {
    compiler.resolverFactory.hooks.resolveOptions
      .for('normal')
      .tap(name, (resolveOptions: any) => {
        resolveOptions.alias = [
          ...normalizeResolverAlias(resolveOptions.alias),
          ...getAliases(aliases),
        ];
        return resolveOptions;
      });
  });
}

export class RxjsInsightsPlugin {
  constructor(private readonly options: RxjsInsightsPluginOptions = {}) {}

  apply(compiler: Compiler) {
    const { name, aliases } = getConfig(this.options);
    applyAliases(name, aliases, compiler);
  }
}
