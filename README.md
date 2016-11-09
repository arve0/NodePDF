[![Build Status](https://travis-ci.org/arve0/nodepdf-series.svg?branch=v0.0.3)](https://travis-ci.org/arve0/nodepdf-series)
# nodepdf-series

Fork of [nodepdf](https://github.com/TJkrusinski/NodePDF) to support
multiple/series of pages without spawning a new phantomjs child for every page:

```js
var PDF = require('nodepdf-series');
PDF(['http://host/page.html', 'http://host/'], function (err) {
	// will create ./host/page.pdf and host.pdf
	console.log('done');
});
```

Or create PDF from local files:
```js
var glob = require('glob');
var path = require('path');
var PDF = require('nodepdf-series');

glob('**/*.html', function (e, files) {
	files = files.map(function(file){
		return 'file://' + path.resolve(file);
	});
	PDF(files, function (err) {
		// will create /path/to/file1.pdf, /path/to/file2.pdf, etc
		console.log('done');
	});
});
```

When not spawning a new phantomjs for each page, we get some
extra performance. Here is a test on 95 local html files:
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

Options are whatever property the [PhantomJS page](http://phantomjs.org/api/webpage/) takes, like [`viewportSize`](http://phantomjs.org/api/webpage/property/viewport-size.html), in addition to `args` which is sent to the phantomjs process when spawning.

### Default options
```js
var defaults = {
  viewportSize: {
    width: 1024,
    height: 1448
  },
  paperSize: {
    width: 1024,
    height: 1448,
    format: 'A4',
    orientation: 'portrait',
    margin: {
      top: '1cm',
      right: '1cm',
      bottom: '1cm',
      left: '1cm'
    }
  },
  zoomFactor: 1,
  args: '',
  captureDelay: 100
};
```
