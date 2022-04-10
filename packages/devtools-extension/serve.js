const esbuild = require('esbuild');
const { rxjsInsightsPlugin } = require('@rxjs-insights/plugin-esbuild');
const webext = require('web-ext');

esbuild.build({
  entryPoints: [
    './src/app/main.tsx',
    './src/devtools-page.ts',
    './src/content-script.ts',
    './src/page-script.js',
  ],
  outdir: 'dist',
  bundle: true,
  watch: true,
  sourcemap: 'linked',
  tsconfig: 'tsconfig.json',
  plugins: [rxjsInsightsPlugin()],
});

webext.cmd.run({
  sourceDir: process.cwd(),
  target: 'chromium',
  startUrl: 'http://localhost:3000',
  chromiumProfile: 'chromium-profile',
  keepProfileChanges: true,
  profileCreateIfMissing: true,
});
