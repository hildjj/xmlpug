'use strict';

const xml = require('libxmljs2');
const xmlpug = require('../lib/index');
const path = require('path');

exports.transform = function(test) {
  test.ok(xmlpug != null);
  const out = xmlpug.transform(`
doctype html
html
  body
    = $$('/root/text()').join('')
    != $('em')
    != $('none')
    = $('count(em)')
    = $('em/text()')
  != "<!--" + $source.toString('utf8') + "-->"`,
    '<root>testing <em>one</em> two</root>');
  test.ok(out);
  test.deepEqual(out,
`<!DOCTYPE html>
<html>
  <body>testing two<em>one</em>1one</body>
  <!-- <root>testing <em>one</em> two</root> -->
</html>
`);
  test.done();
};

exports.xml = function(test) {
  test.ok(xmlpug != null);
  const out = xmlpug.transform(`
foot
  = $('em/text()')
`,
    xml.parseXml('<root>testing <em>one</em> two</root>'));
  test.ok(out);
  test.deepEqual(out,
`<?xml version='1.0'?>
<foot>one</foot>
`);
  test.done();
};

exports.transformFile = function(test) {
  const pug = path.join(__dirname, '..', 'examples', 'test.pug');
  const xml = path.join(__dirname, '..', 'examples', 'test.xml');
  return xmlpug.transformFile(pug, xml, {
    define: {
      mode: 'nodeunit transformFile'
    }
  }).then(function(out) {
    test.ok(out);
    return test.done();
  });
};

exports.xformBuffer = function(test) {
  const buf = Buffer.from('<foo>boo</foo>');
  const pug = path.join(__dirname, 'bar.pug');
  return xmlpug.transformFile(pug, buf).then(function(out) {
    test.ok(out);
    return test.done();
  });
};

exports.xformDoc = (test) => {
  const doc = xml.parseXml('<foo>boo</foo>');
  const pug = path.join(__dirname, 'bar.pug');
  return xmlpug.transformFile(pug, doc).then(function(out) {
    test.ok(out);
    return test.done();
  });
};

exports.edges = (test) => {
  const doc = xml.parseXml('<foo>boo</foo>');
  const pug = path.join(__dirname, 'bar.pug');
  test.throws(() => xmlpug.transformFile(pug, 0));
  return xmlpug.transformFile(pug, doc, {
    pugFileName: 'none',
    xmlFilename: 'none'
  })
  .then((out) => {
    test.ok(out);
    return xmlpug.transformFile(pug, Buffer.from('<foo>boo</foo>'), {
      pugFileName: 'none',
      xmlFilename: 'none'
    });
  })
  .then((out) => test.ok(out))
  .then(() => test.done());
};

