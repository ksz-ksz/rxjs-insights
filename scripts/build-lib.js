const glob = require('glob');
const esbuild = require('esbuild');
const esbuildPluginAlias = require('esbuild-plugin-alias');
const path = require('path');
const fs = require('fs');

async function getEntryPoints(cwd, include, exclude) {
  return new Promise((resolve, reject) => {
    glob(include, { cwd, ignore: exclude }, (error, files) => {
      if (error) {
        reject(error);
      } else {
        resolve(files);
      }
    });
  });
}

function getAlias(cwd, alias) {
  return Object.fromEntries(
    Object.entries(alias).map(([key, value]) => [key, path.join(cwd, value)])
  );
}

async function buildTarget(
  cwd,
  { format, bundle = false, include = 'src/**/*.ts', exclude, alias, loader }
) {
  const entryPoints = await getEntryPoints(cwd, include, exclude);
  await esbuild.build({
    format,
    bundle,
    entryPoints,
    target: 'es2017',
    sourcemap: 'inline',
    tsconfig: 'tsconfig.lib.json',
    keepNames: true,
    outdir: `dist/${format}`,
    outbase: 'src',
    plugins: alias ? [esbuildPluginAlias(getAlias(cwd, alias))] : [],
    loader,
    define: {
      PACKAGE_VERSION: JSON.stringify(
        require(path.join(cwd, 'package.json')).version
      ),
    },
  });
}

function getBuild(cwd) {
  return JSON.parse(fs.readFileSync(path.join(cwd, 'build.json'), 'utf-8'));
}

async function main(cwd) {
  const build = getBuild(cwd);
  for (const target of build.targets) {
    await buildTarget(cwd, target);
  }
}

main(process.cwd());
