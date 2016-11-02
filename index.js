'use strict';

var child = require('./child.js');
var Emitter = require('events').EventEmitter;

var defaults = {
  'viewportSize': {
    'width': 2880,
    'height': 1440
  },
  'paperSize': {
    'format': 'A4',
    'orientation': 'portrait',
    'margin': {
      'top': '1cm',
      'right': '1cm',
      'bottom': '1cm',
      'left': '1cm'
    }
  },
  'zoomFactor': 1,
  'args': '',
  'captureDelay': 100
};

//code from https://github.com/rxaviers/cldr
var merge = function() {
  var destination = {},

  sources = [].slice.call(arguments, 0);
  sources.forEach(function(source) {
    var prop;

    for (prop in source) {
      if (prop in destination && Array.isArray(destination[prop])) {
        // Concat Arrays
        destination[prop] = destination[prop].concat(source[prop]);
      } else if (prop in destination && typeof destination[prop] === "object") {
        // Merge Objects
        destination[prop] = merge(destination[prop], source[prop] );
      } else {
        // Set new values
        destination[prop] = source[prop];
      };
    };
  });

  return destination;
};

/**
 *  Constructor interface
 */

var exports = module.exports = Pdf;

function Pdf (url, opts){
  var self = this;

  this.url = url;
  this.options = merge(defaults, opts);

  child.supports(function(support){
    if (!support) self.emit('error', 'PhantomJS not installed');
    if (support) self.run();
  });

  return this;
};

/**
 *  Inherit the event emitter
 */

Pdf.prototype = Object.create(Emitter.prototype);

/**
 *  Run the process
 *
 *  @method run
 */

Pdf.prototype.run = function() {
  var self = this;
  var ps = child.exec(this.url, this.options);

  ps.on('exit', function(c, d){
    if (c != 0) return self.emit('error', 'PDF conversion failed with exit of '+c);

    self.emit('done');
  });

  ps.stdout.on('data', function(std){
    self.emit('stdout', std);
  });

  ps.stderr.on('data', function(std){
    self.emit('stderr', std);
  });
};

/**
 *  Use callback style rendering
 *
 *  @param {String} address
 *  @param {Options} address
 *  @param {Function} callback
 */

exports.render = function(address, options, callback) {
  if (typeof options == 'function') {
    callback = options;
    options = defaults;
  };

  options = merge(defaults, options);

  child.supports(function(support){
    if (!support) callback(new Error('PhantomJS not installed'));

    var ps = child.exec(address, options);

    ps.on('exit', function(c, d){
      if (c) return callback(new Error('Conversion failed with exit of '+c));

      return callback(null);
    });
  });
};
