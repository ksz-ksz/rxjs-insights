const esbuild = require('esbuild');

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
  minify: true,
  loader: { '.svg': 'dataurl' },
  tsconfig: 'tsconfig.lib.json',
});
