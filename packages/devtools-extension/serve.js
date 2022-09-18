const esbuild = require('esbuild');
const { rxjsInsightsPlugin } = require('@rxjs-insights/plugin-esbuild');
const path = require('path');
const fs = require('fs');

const target = process.argv[2];
switch (target) {
  case 'firefox':
    serve('firefox');
    break;
  case 'chromium':
    serve('chromium');
    break;
  default:
    throw new Error(`Invalid target: ${JSON.stringify(target)}`);
}

async function serve(target) {
  esbuild.build({
    entryPoints: [
      './src/app/main.tsx',
      './src/devtools-page.ts',
      './src/sources-page.ts',
      './src/content-script.ts',
      './src/background-script.ts',
      './src/page-script.js',
    ],
    outdir: 'dist',
    bundle: true,
    loader: { '.svg': 'dataurl' },
    watch: true,
    sourcemap: 'linked',
    tsconfig: 'tsconfig.json',
    plugins: [
      rxjsInsightsPlugin({
        installModule: path.join(__dirname, './src/app/install-module.ts'),
      }),
    ],
  });

  fs.copyFileSync(`manifest-${target}.json`, 'manifest.json');

  (await import('web-ext')).cmd.run({
    verbose: true,
    sourceDir: process.cwd(),
    target: target === 'firefox' ? 'firefox-desktop' : 'chromium',
    startUrl: 'http://localhost:3000',
    chromiumProfile: 'chromium-profile',
    // firefoxProfile: 'firefox-profile', // extension does not always load with that
    keepProfileChanges: true,
    profileCreateIfMissing: true,
  });
}
