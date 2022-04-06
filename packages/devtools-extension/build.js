const esbuild = require('esbuild');

esbuild.build({
  entryPoints: [
    './src/index.ts',
    './src/devtools-page.ts',
    './src/content-script.ts',
    './src/page-script.js',
  ],
  outdir: 'dist',
  bundle: true,
  sourcemap: 'linked',
  tsconfig: 'tsconfig.json',
});
