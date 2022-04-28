const esbuild = require('esbuild');
const { rxjsInsightsPlugin } = require('@rxjs-insights/plugin-esbuild');

esbuild.serve(
  { servedir: '.', host: 'localhost', port: 3000 },
  {
    entryPoints: ['src/index.ts', 'src/polyfills.ts'],
    outdir: 'dist',
    bundle: true,
    sourcemap: 'linked',
    keepNames: true,
    tsconfig: 'tsconfig.json',
    plugins: [rxjsInsightsPlugin({ installMode: 'conditional' })],
  }
);
