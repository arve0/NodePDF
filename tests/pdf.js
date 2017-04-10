'use strict';

var assert = require('assert');

var PDF = require('../index.js');
var child = require('../child.js');
var fs = require('fs');
var path = require('path');
var FP = process.env.PWD || process.cwd() || __dirname;

function exists(filename) {
  filename = FP + '/' + filename;
  try {
    var fd = fs.openSync(filename, 'r');
  } catch (e) {
    return false;
  }
  fs.close(fd);
  return true;
}

// clean up before and after
describe('all tests', function() {
  var files = ['httpbin.org.pdf', 'fixture.pdf', 'about', 'about:blank.pdf', 'www.yahoo.com.pdf', 'httpbin.org/html.pdf',  'httpbin.org/ip.pdf', 'testPath/html.pdf', 'testPath/ip.pdf'];
  function deleteAll(){
    files.forEach(function(filename){
      if (!exists(filename)) return;
      filename = path.join(FP, filename);
      console.log('deleting ' + filename);
      fs.unlinkSync(filename);
    });
  }
  before(deleteAll);
  after(deleteAll);

  describe('child#supports()', function(){
    it('checks to see if phantomjs is installed', function(d){
      child.supports(function(exists){
        assert(exists);
        d();
      });
    });
  });

  describe('child#supports()', function(){
    it('checks to see if asdfhijk is installed', function(d){
      child.supports(function(exists){
        assert(!exists);
        d();
      }, 'asdfhijk');
    });
  });

  describe('pdf#render()', function(){
    it('renders single local file to pdf', function(d){
      this.timeout(10000);
      PDF('fixture.html', function(err){
        assert.equal(err, null);
        assert(exists('fixture.pdf'));
        d();
      });
    });

    it('renders several pages', function(d){
      this.timeout(10000);
      PDF(['http://httpbin.org/html', 'http://httpbin.org/ip'], function(err){
        assert.equal(err, null);
        assert(exists('httpbin.org/html.pdf'));
        assert(exists('httpbin.org/ip.pdf'));
        d();
      });
    });

    it('renders several pages on setted path', function(d){
        this.timeout(10000);
        PDF(['http://httpbin.org/html', 'http://httpbin.org/ip'], {outPath: 'testPath'}, function(err){
            assert.equal(err, null);
            assert(exists('testPath/html.pdf'));
            assert(exists('testPath/ip.pdf'));
            d();
        });
    });
  });
});
