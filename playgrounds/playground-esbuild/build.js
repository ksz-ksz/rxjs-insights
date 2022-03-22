const esbuild = require('esbuild');
const { rxjsInsightsPlugin } = require('@rxjs-insights/plugin-esbuild');

esbuild.build({
  entryPoints: ['src/index.ts', 'src/polyfills.ts'],
  outdir: 'dist',
  bundle: true,
  sourcemap: 'inline',
  keepNames: true,
  plugins: [rxjsInsightsPlugin()],
});
