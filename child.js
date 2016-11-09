'use strict';

var child = require('child_process');
var shq = require('shell-quote').quote;
var fs = require('fs');
var phantomjs = require('phantomjs-prebuilt');

/**
 *  Execute the command
 *
 *  @param {String} url
 *  @param {Object} options
 *  @param {Function} [cb]
 */
exports.exec = function(url, options, cb){
  var args = [
    options.args,
    __dirname+'/render.js',
    JSON.stringify(url),
    JSON.stringify(options)
  ];

// run this command in shell to debug phantomjs
//  console.log(cmd + ' ' + args.join(' '));

  var phantom = child.spawn(phantomjs.path, args);

  phantom.stderr.pipe(process.stderr);

  phantom.on('exit', function (code, signal) {
    if (code) {
      return done('Exited with code ' + code);
    }
    done();
  });

  phantom.on('error', function (err) {
    done(err);
  });

  // may be called from both exit and error event
  var exited = false;
  function done (err) {
    if (exited) {
      return;
    }
    exited = true;
    if (cb) {
      // console.error('Failed. Try running this command:');
      // console.error('"' + phantomjs.path + '" ' + args.join(' '));
      return cb(err);
    }
    if (err) {
      throw err;
    }
  }
};

/**
 *  Check to see if the environment has a command
 */

exports.supports = function(cb, cmd) {
  fs.stat((cmd || phantomjs.path), function(err){
    cb(!err);
  });
};
