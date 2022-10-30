# Development

## Prerequisites

* npm 7

## Workspace setup

* Run `npm run bootstrap` to install dependencies and link the packages in the workspace.
* Run `npm run build` to build all the packages.

## Extension devmode

* Run `cd playgrounds/playground-esbuild` and then `npm run start` to start test app (could be any other of the playground apps).
* Run `cd packages/devtools-extension` and then `npm run start:chromium` to start Chromium extension devmode or `npm run start:firefox` to start Firefox extension devmode.

## Pack extension

* Run `cd packages/devtools-extension`
* Run `npm run build`
* Run `npm run pack-extension:chromium` to pack Chromium extension or `npm run start:firefox` to pack Firefox extension.
