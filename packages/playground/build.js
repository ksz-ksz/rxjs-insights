const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.ts', 'src/polyfills.ts'],
  outdir: 'dist',
  bundle: true,
  sourcemap: 'inline',
  keepNames: true,
});
