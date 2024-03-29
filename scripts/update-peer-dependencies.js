const fs = require('fs');
const path = require('path');

function main(cwd) {
  const packageJsonPath = path.join(cwd, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  for (let peerDependency of Object.keys(packageJson.peerDependencies)) {
    if (peerDependency.startsWith('@rxjs-insights/')) {
      packageJson.peerDependencies[peerDependency] = packageJson.version;
    }
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

main(process.cwd());
