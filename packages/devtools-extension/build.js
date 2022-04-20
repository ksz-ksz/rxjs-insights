const esbuild = require('esbuild');

esbuild.build({
  entryPoints: [
    './src/app/main.tsx',
    './src/devtools-page.ts',
    './src/content-script.ts',
    './src/page-script.js',
    './src/background.js',
  ],
  outdir: 'dist',
  bundle: true,
  tsconfig: 'tsconfig.json',
});
