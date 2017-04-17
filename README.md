[![Build Status](https://travis-ci.org/arve0/nodepdf-series.svg?branch=v0.0.3)](https://travis-ci.org/arve0/nodepdf-series)
# nodepdf-series

Render a list of pages to PDF:

```js
var PDF = require('nodepdf-series');

PDF(['http://httpbin.org', 'http://httpbin.org/get'], function (err) {
  if (err) {
    throw err;
  } else {
    console.log('httpbin.org.pdf and httpbin.org/get.pdf created');
  }
});
```

Render to a specified path and/or file names:

```js
var PDF = require('nodepdf-series');

PDF(['http://httpbin.org', 'http://httpbin.org/get'],
    { outPath: 'testPath', fileNames: ['file1', 'file2'] },
    function (err) {
      if (err) throw err;
      // testPath/file1.pdf and testPath/file2.pdf created
    });
```

Works with local files too. This renders all HTML-files in subdirectories of current path:

```js
var glob = require('glob');
var path = require('path');
var PDF = require('nodepdf-series');

glob('**/*.html', function (error, files) {
  if (error) {
    throw error;
  }
  // append file:// and resolve path to files
  files = files.map(file => 'file://' + path.resolve(file));
  // render them
  PDF(files, function (err) {
    if (err) {
      throw err;
    } else {
      // now PDF-files should live beside HTML-files, for example:
      // path/to/file1.html and path/to/file1.pdf
      console.log('done');
    }
  });
});
```

## Installation
```
npm install nodepdf-series
```

## API

Signature:

```js
PDF(pages, callback);
PDF(pages, options, callback);
```

`pages` is an array of urls.
`options` is an object with properties:

- `outPath` - Which directory to store PDFs. If not set, the current directory and the URL path will be used.
- `fileNames` - An array of filenames to use. If not set, last part of URL will be used.
- `args` - [Arguments](http://phantomjs.org/api/command-line.html) for the PhantomJS process.
- Properties the [PhantomJS page](http://phantomjs.org/api/webpage/) accept, like [`viewportSize`](http://phantomjs.org/api/webpage/property/viewport-size.html).

`callback` is called when the rendering is done.

### Default options
```js
var defaults = {
  viewportSize: {
    // this should be equal to paper size
    width: 1050,
    height: 1485
  },
  paperSize: {
    /**
     * A4 ratio in millimeters: 210 x 297
     * DPI is hardcoded 72 in phantomJS.
     * A resolution of 1050px will give 1050 / 72 * 25.4 ~ 370 mm width,
     * which is way much larger than A4. Most printers will handle this,
     * and scale correctly to given paper source.
     */
    width: 1050,
    height: 1485,
    orientation: 'portrait',
    margin: '1cm'
  },
  args: '',
  captureDelay: 100
};
```

## Performance
nodepdf-series spawns only one child of phantomjs, giving some
extra performance compared to [nodepdf](https://github.com/TJkrusinski/NodePDF).
Here is a test on 95 local html files:

```shell
$ time node nodepdf.js
real    9m32.928s
user    5m56.769s
sys     0m56.142s

$ time node nodepdf-series.js
real    2m47.053s
user    1m55.567s
sys     0m5.104s
```

You may also want to spread load on all CPU-cores:

```js
var cpus = require('os').cpus().length;
var chunk = require('lodash.chunk');
var each = require('async-each');

var files = [
  'path/to/file1.html', 'path/to/file5.html', 'path/to/file9.html',
  'path/to/file2.html', 'path/to/file6.html', 'path/to/file10.html',
  'path/to/file3.html', 'path/to/file7.html', 'path/to/file11.html',
  'path/to/file4.html', 'path/to/file8.html', 'path/to/file12.html',
];

var chunkSize = Math.round(files.length / cpus);
var chunks = chunk(files, chunkSize);

each(chunks, function (chunk, cb) {
  PDF(chunk, cb);
}, function (err) {
  if (err) {
    console.error('Something went wrong.');
    console.error(err);
  } else {
    // now PDF-files should live beside HTML-files, for example:
    // path/to/file1.html and path/to/file1.pdf
    console.log('done');
  }
});
```

