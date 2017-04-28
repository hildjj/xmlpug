'use strict';

const bb = require('bluebird');
const fs = bb.promisifyAll(require('fs'));
let cache = {};

exports.read = function read(filename, xform) {
  if (filename == null) {
    return bb.resolve(null);
  }
  let last = cache[filename];
  if (last != null) {
    return bb.resolve(last);
  }
  return fs.readFileAsync(filename).then(function(last) {
    if (xform != null) {
      return xform(last);
    } else {
      return last;
    }
  }).then(function(last) {
    cache[filename] = last;
    return last;
  });
};

exports.readSync = function readSync(filename, xform) {
  var last;
  if (filename == null) {
    throw new Error('filename required');
  }
  last = cache[filename];
  if (last != null) {
    return last;
  }
  last = fs.readFileSync(filename);
  if (typeof(xform) === 'function') {
    last = xform(last);
  }
  cache[filename] = last;
  return last;
};

exports.clear = function clear() {
  return cache = {};
};
