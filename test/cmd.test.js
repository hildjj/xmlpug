'use strict';

const bb = require('bluebird');
const execFile = require('child_process').execFile;
const fs = bb.promisifyAll(require('fs'));
const path = require('path');
const cmd = require('../lib/cmd');

const XMLPUG = path.join(__dirname, '..', 'bin', 'xmlpug');
const PUG = path.join(__dirname, '..', 'examples', 'test.pug')

function exec(file, stdin, ...args) {
  return bb.fromCallback((cb) => {
    const child = execFile(file, args, cb);
    if (stdin) {
      child.stdin.end(stdin);
    }
  }, {multiArgs:true});
}

exports.commands = function(test) {
  const out = path.join(__dirname, '..', 'examples', 'test.html');
  return fs.unlinkAsync(out)
  .catch(() => void 0)
  .finally(() => cmd([
    process.execPath,
    'xmlpug',
    PUG,
    path.join(__dirname, '..', 'examples', 'test.xml'),
    '-o',
    out,
    '-p'
  ]))
  .then((outdata) => {
    test.ok(!outdata);
    return fs.readFileAsync(out);
  })
  .then((outdata) => {
    test.ok(outdata);
    test.done();
  });
};

exports.help = function(test) {
  return exec(XMLPUG, null, '-h')
  .spread((stdout, stderr) => {
    test.ok(stdout);
    test.ok(!stderr);

    return exec(XMLPUG)
    .spread((stdout, stderr) => {
      test.ok(stdout);
      test.ok(!stderr);
    });
  })
  .then(() => test.done());
};

exports.dash = function(test) {
  return exec(XMLPUG,
              '<foo>huh</foo>\n',
              path.join(__dirname, 'bar.pug'),
              '-')
  .spread((stdout, stderr) => {
    test.equals(stdout, '<bar>huh</bar>');
    test.ok(!stderr);
  })
  .then(() => test.done());
};
