'use strict';

var child = require('./child.js');

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
