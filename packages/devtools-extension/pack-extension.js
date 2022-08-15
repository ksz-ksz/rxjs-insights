const fs = require('fs');
const archiver = require('archiver');

const output = fs.createWriteStream(__dirname + '/extension.zip');
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
archive.file('manifest.json');
archive.file('sources-page.css');
archive.file('sources-page.html');
archive.file('style.css');

archive.finalize();
