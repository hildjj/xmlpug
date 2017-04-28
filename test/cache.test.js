'use strict';

const cache = require('../lib/cache');

exports.tearDown = function(cb) {
  cache.clear();
  return cb();
};

exports.read = function(test) {
  return cache.read(__filename).then(function(buf1) {
    return cache.read(__filename).then(function(buf2) {
      test.equals(buf1, buf2);
      return test.done();
    });
  });
};

exports.readFail = function(test) {
  return cache.read(__filename + '_booga')['catch'](function(e) {
    test.ok(e != null);
    return cache.read(null).then(function(e) {
      test.ok(e == null);
      return test.done();
    });
  });
};

exports.readXform = function(test) {
  return cache.read(__filename, function(buf) {
    return buf.toString();
  }).then(function(buf1) {
    return cache.read(__filename).then(function(s) {
      test.equals(buf1, s);
      return test.done();
    });
  });
};

exports.readSync = function(test) {
  const buf1 = cache.readSync(__filename);
  const buf2 = cache.readSync(__filename);
  test.equals(buf1, buf2);
  return test.done();
};

exports.readSyncFail = function(test) {
  test.throws(function() {
    return cache.readSync(null);
  });
  test.throws(function() {
    return cache.readSync(__filename + '_booga');
  });
  return test.done();
};

exports.readSyncXform = function(test) {
  const buf1 = cache.readSync(__filename, function(buf) {
    return buf.toString();
  });
  const buf2 = cache.readSync(__filename);
  test.equals(buf1, buf2);
  return test.done();
};
