const fs = require('fs');
const path = require('path');

function main(cwd) {
  const packageJsonPath = path.join(cwd, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  for (let peedDependency of Object.keys(packageJson.peerDependencies)) {
    if (peedDependency.startsWith('@rxjs-insights/')) {
      packageJson.peerDependencies[peedDependency] = packageJson.version;
    }
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

main(process.cwd());
