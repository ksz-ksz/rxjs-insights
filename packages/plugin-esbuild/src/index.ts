import { Plugin, PluginBuild } from 'esbuild';
import * as path from 'path';
import resolveCwd from 'resolve-cwd';

const PLUGIN_NAME = 'RxjsInsightsPlugin';

function getRxjsMajorVersion() {
  try {
    const rxjsPackage = require(resolveCwd('rxjs/package.json'));
    return rxjsPackage.version.split('.')[0];
  } catch (e) {
    throw new Error(
      `${PLUGIN_NAME} requires the 'rxjs' package to be installed.`
    );
  }
}

function getPackagePath(packageName: string) {
  const packageJsonPath = resolveCwd(`${packageName}/package.json`);
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

function getAliases(
  rxjsMajorVersion: string,
  installModule?: string
): Record<string, string> {
  const rxjsPackagePath = getRxjsPackagePath();
  const rxjsInsightsPackagePath = getRxjsInsightsPackagePath(rxjsMajorVersion);

  return {
    rxjs: path.join(rxjsInsightsPackagePath, 'rxjs'),
    'rxjs/operators': path.join(rxjsInsightsPackagePath, 'rxjs', 'operators'),
    '@rxjs-insights/rxjs-alias-module': rxjsPackagePath,
    '@rxjs-insights/rxjs-alias-module/operators': path.join(
      rxjsPackagePath,
      'operators'
    ),
    '@rxjs-insights/rxjs-install-module':
      installModule ?? rxjsInsightsPackagePath,
  };
}

function setupAlias(options: RxjsInsightsPluginOptions, build: PluginBuild) {
  const { installModule } = options;
  const rxjsMajorVersion = getRxjsMajorVersion();
  const aliases = getAliases(rxjsMajorVersion, installModule);
  const filter = new RegExp(`^(${Object.keys(aliases).join('|')})$`);
  build.onResolve({ filter }, ({ path, ...args }) =>
    build.resolve(aliases[path], args)
  );
}

function setupDefine(options: RxjsInsightsPluginOptions, build: PluginBuild) {
  const { install = true } = options;
  if (install) {
    build.initialOptions.define = build.initialOptions.define || {};
    build.initialOptions.define['INSTALL_RXJS_INSIGHTS'] = 'true';
  }
}

export function rxjsInsightsPlugin(
  options: RxjsInsightsPluginOptions = {}
): Plugin {
  return {
    name: PLUGIN_NAME,
    setup(build) {
      setupAlias(options, build);
      setupDefine(options, build);
    },
  };
}
