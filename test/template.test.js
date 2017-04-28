'use strict';

const xmlpug = require('../lib/index');
const path = require('path');

exports.transform = function(test) {
  test.ok(xmlpug != null);
  return xmlpug.transform(`
doctype html
html
  body
    = $$('/root/text()').join('')
    != $('em')
    != $('none')
    = $('count(em)')
    = $('em/text()')
  != "<!--" + $source.toString('utf8') + "-->"`,
    '<root>testing <em>one</em> two</root>', {
      html: true,
      pretty: true
    }).then(function(out) {
      test.ok(out);
      test.deepEqual(out,
        `<!DOCTYPE html>
<html>
  <body>testing two<em>one</em>1one</body>
  <!-- <root>testing <em>one</em> two</root> -->
</html>
`);
      return test.done();
    });
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

exports.cmd = function(test) {
  return xmlpug.cmd([
    'node',
    'xmlpug',
    path.join(__dirname, '..', 'examples', 'test.pug'),
    path.join(__dirname, '..', 'examples', 'test.xml'),
    '-o',
    path.join(__dirname, '..', 'examples', 'test.html'),
    '-p'
  ]).then(function(out) {
    test.ok(out);
    return test.done();
  });
};

exports.genSource = function(test) {
  return xmlpug.cmd([
    'node',
    'xmlpug',
    path.join(__dirname, '..', 'examples', 'test.pug'),
    '--source',
    path.join(__dirname, '..', 'examples', 'testSource.js'),
    '-c',
    path.join(__dirname, '..', 'examples', 'config.json')
  ]).then((out) => {
    test.ok(!out);
    return test.done();
  });
};

exports.xformBuffer = function(test) {
  const buf = new Buffer('<foo>boo</foo>');
  const pug = path.join(__dirname, 'bar.pug');
  return xmlpug.transformFile(pug, buf).then(function(out) {
    test.ok(out);
    return test.done();
  });
};
