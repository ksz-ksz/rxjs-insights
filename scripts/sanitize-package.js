const fs = require('fs');
const path = require('path');

const removeKeys = ['scripts', 'publishConfig', 'devDependencies'];

function main(cwd) {
  const packageJsonPath = path.join(cwd, 'package.json');
  const packageJsonBakPath = path.join(cwd, 'package.json.bak');

  fs.copyFileSync(packageJsonPath, packageJsonBakPath);

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  for (let removeKey of removeKeys) {
    delete packageJson[removeKey];
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

main(process.cwd());
