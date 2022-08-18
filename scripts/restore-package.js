const fs = require('fs');
const path = require('path');

function main(cwd) {
  const packageJsonPath = path.join(cwd, 'package.json');
  const packageJsonBakPath = path.join(cwd, 'package.json.bak');

  fs.unlinkSync(packageJsonPath);
  fs.copyFileSync(packageJsonBakPath, packageJsonPath);
  fs.unlinkSync(packageJsonBakPath);
}

main(process.cwd());
