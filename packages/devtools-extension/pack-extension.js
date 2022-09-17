const fs = require('fs');
const archiver = require('archiver');

const target = process.argv[2];
switch (target) {
  case 'firefox':
    packExtension('firefox');
    break;
  case 'chromium':
    packExtension('chromium');
    break;
  default:
    throw new Error(`Invalid target: ${JSON.stringify(target)}`);
}

function packExtension(target) {
  const output = fs.createWriteStream(`${__dirname}/extension-${target}.zip`);
  const archive = archiver('zip', {
    zlib: { level: 9 },
  });

  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('extension.zip created');
  });

  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
    } else {
      throw err;
    }
  });

  archive.on('error', function (err) {
    throw err;
  });

  archive.pipe(output);

  archive.directory('dist/');
  archive.directory('icons/');
  archive.file('devtools-page.html');
  archive.file('index.html');
  archive.file(`manifest-${target}.json`, { name: 'manifest.json' });
  archive.file('sources-page.css');
  archive.file('sources-page.html');
  archive.file('style.css');

  archive.finalize();
}
