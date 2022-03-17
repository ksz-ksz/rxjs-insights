import * as path from 'path';
import { Compiler, DefinePlugin, ResolveOptions } from 'webpack';

const PLUGIN_NAME = 'RxjsInsightsPlugin';

function getRxjsMajorVersion() {
  try {
    const rxjsPackage = require('rxjs/package.json');
    return rxjsPackage.version.split('.')[0];
  } catch (e) {
    throw new Error(
      `${PLUGIN_NAME} requires the 'rxjs' package to be installed.`
    );
  }
}

function getPackagePath(packageName: string) {
  const packageJsonPath = require.resolve(`${packageName}/package.json`);
  return packageJsonPath.substring(
    0,
    packageJsonPath.length - '/package.json'.length
  );
}

function getRxjsPackagePath() {
  try {
    return getPackagePath('rxjs');
  } catch (e) {
    throw new Error(
      `${PLUGIN_NAME} requires the 'rxjs' package to be installed.`
    );
  }
}

function getRxjsInsightsPackagePath(rxjsMajorVersion: string) {
  const packageName = `@rxjs-insights/rxjs${rxjsMajorVersion}`;
  try {
    return getPackagePath(packageName);
  } catch (e) {
    throw new Error(
      `${PLUGIN_NAME} requires the '${packageName}' to be installed to match the version of the installed 'rxjs' package.`
    );
  }
}

function normalizeAlias(alias: ResolveOptions['alias']) {
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

function getRxjsInsightsAliases(
  rxjsMajorVersion: string,
  installModule: string = `@rxjs-insights/rxjs${rxjsMajorVersion}`
) {
  const rxjsPackagePath = getRxjsPackagePath();
  const rxjsInsightsPackagePath = getRxjsInsightsPackagePath(rxjsMajorVersion);
  return [
    {
      onlyModule: true,
      name: 'rxjs',
      alias: path.join(rxjsInsightsPackagePath, 'rxjs'),
    },
    {
      onlyModule: true,
      name: 'rxjs/operators',
      alias: path.join(rxjsInsightsPackagePath, 'rxjs', 'operators'),
    },
    {
      onlyModule: true,
      name: '@rxjs-insights/rxjs-alias-module',
      alias: rxjsPackagePath,
    },
    {
      onlyModule: true,
      name: '@rxjs-insights/rxjs-alias-module/operators',
      alias: path.join(rxjsPackagePath, 'operators'),
    },
    {
      onlyModule: true,
      name: '@rxjs-insights/rxjs-install-module',
      alias: installModule,
    },
  ];
}

export interface RxjsInsightsPluginOptions {
  /**
   * If true, sets the INSTALL_RXJS_INSIGHTS global variable that instructs the installModule to install the instrumentation.
   * Defaults to `true`.
   */
  install?: boolean;

  /**
   * Module that would be used to install the instrumentation.
   * Defaults to `@rxjs-insights/rxjs<rxjs-major-version>`.
   */
  installModule?: string;
}

export class RxjsInsightsPlugin {
  constructor(private readonly options: RxjsInsightsPluginOptions = {}) {}

  apply(compiler: Compiler) {
    this.applyAlias(compiler);
    this.applyDefine(compiler);
  }

  private applyAlias(compiler: Compiler) {
    const { installModule } = this.options;

    const rxjsMajorVersion = getRxjsMajorVersion();
    const rxjsInsightsAliases = getRxjsInsightsAliases(
      rxjsMajorVersion,
      installModule
    );
    compiler.hooks.afterResolvers.tap(PLUGIN_NAME, (compiler) => {
      compiler.resolverFactory.hooks.resolveOptions
        .for('normal')
        .tap(PLUGIN_NAME, (resolveOptions) => {
          resolveOptions.alias = [
            ...normalizeAlias(resolveOptions.alias),
            ...rxjsInsightsAliases,
          ];
          return resolveOptions;
        });
    });
  }

  private applyDefine(compiler: Compiler) {
    const { install = true } = this.options;
    if (install) {
      new DefinePlugin({
        INSTALL_RXJS_INSIGHTS: true,
      }).apply(compiler);
    }
  }
}
