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
   * Module that would be used to install the instrumentation.
   * Defaults to `@rxjs-insights/rxjs<rxjs-major-version>`.
   */
  installModule?: string;
}

export interface RxjsInsightsPluginConfig {
  name: string;
  aliases: Record<string, string>;
}

function getAliases(installModule?: string): Record<string, string> {
  const rxjsMajorVersion = getRxjsMajorVersion();
  const rxjsPackagePath = getRxjsPackagePath();
  const rxjsInsightsPackagePath = getRxjsInsightsPackagePath(rxjsMajorVersion);

  return {
    rxjs: path.join(rxjsInsightsPackagePath, 'rxjs'),
    'rxjs/operators': path.join(rxjsInsightsPackagePath, 'rxjs', 'operators'),
    '@rxjs-insights/rxjs-module': rxjsPackagePath,
    '@rxjs-insights/rxjs-module/operators': path.join(
      rxjsPackagePath,
      'operators'
    ),
    '@rxjs-insights/install-module': installModule ?? rxjsInsightsPackagePath,
  };
}

export function getConfig(
  options: RxjsInsightsPluginOptions
): RxjsInsightsPluginConfig {
  const aliases = getAliases(options.installModule);

  return { name: PLUGIN_NAME, aliases };
}
