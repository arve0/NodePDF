var webpage = require('webpage');
var system = require('system');

// monkey-patch console.error
// https://github.com/ariya/phantomjs/issues/10150
console.error = function () {
    system.stderr.write(Array.prototype.join.call(arguments, ' ') + '\n');
};

function initializePage (options, page) {
  if (options.cookies) {
    options.cookies.forEach(page.addCookie);
  }

  for (var key in options) {
    if (options.hasOwnProperty(key) && page.hasOwnProperty(key)) {
      page[key] = options[key];
    }
  }
}

if (system.args.length < 2) {
  console.error('incorrect number of args');
  phantom.exit(1);
} else {
  var page;
  var options = JSON.parse(system.args[2]);
  var urls = JSON.parse(system.args[1]);
  if (!Array.isArray(urls)) {
    urls = [urls];
  }
  var i = 0;

  process();

  function process() {
    if (i < urls.length) {
      var url = urls[i++];
      // add extra / on windows: file://C:/url -> file:///C:/url
      url = url.replace(/file\:\/\/([A-Za-z])\:/, 'file:///$1:');
      // create a new page for each url
      page = webpage.create();
      page.onLoadFinished = onLoadFinished;
      initializePage(options, page);
      page.open(url);
    } else {
      phantom.exit(0);
    }
  }

  page.onError = function (msg, trace) {
    console.error(msg);
    trace.forEach(function(item) {
        console.error('  ', item.file, ':', item.line);
    });
  };

  function onLoadFinished (status) {
    if (status !== 'success') {
      console.error('ERROR, status: ' + status);
      console.error('unable to load ' + urls[i]);
      page.close();  // free memory
      process(); // recursive
    } else {
      window.setTimeout(function () {
        var out = page.url;
        out = out.replace(/%20/g, ' ');
        out = out.replace(/^.*:\/\//, ''); // something://url -> 'url'
        out = out.replace(/(\.html|\/|)$/, '.pdf'); // if .html -> .pdf, else + .pdf
        if ((window.navigator.userAgent.indexOf("Windows") != -1) &&
            (out[0] == '/')) {
            out = out.substring(1);
        }
        console.log('saving ' + page.url + ' to ' + out);
        page.render(out, { format: 'pdf' });
        page.close();  // free memory
        process();
      }, options.captureDelay || 0);
    }
  };
}
