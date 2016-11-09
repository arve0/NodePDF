'use strict';

var child = require('./child.js');

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

/**
 * Render pages til PDFs.
 *
 *  @param {array of strings} pages
 *  @param {object} options
 *  @param {function} called when done
 */

module.exports = function (pages, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = defaults;
  };

  options = Object.assign(defaults, options);

  child.supports(function (support){
    if (!support) {
      callback(new Error('PhantomJS not installed'));
    }

    child.exec(pages, options, callback);
  });
};
