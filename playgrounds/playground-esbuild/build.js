const esbuild = require('esbuild');
const { rxjsInsightsPlugin } = require('@rxjs-insights/plugin-esbuild');

esbuild.build({
  entryPoints: ['src/index.ts', 'src/polyfills.ts'],
  outdir: 'dist',
  bundle: true,
  sourcemap: 'linked',
  keepNames: true,
  tsconfig: 'tsconfig.json',
  plugins: [rxjsInsightsPlugin()],
});
