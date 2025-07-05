import {Buffer} from 'node:buffer';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {parseXml} from 'libxmljs2';
import {readFileSync} from 'node:fs';
import test from 'ava';
import {transform} from '../lib/index.js';

const __dirname = fileURLToPath(new URL('./', import.meta.url));
const TEST_PUG_SRC = join(__dirname, '..', 'examples', 'test.pug');
const TEST_PUG_DATA = readFileSync(TEST_PUG_SRC);
const TEST_XML_SRC = join(__dirname, '..', 'examples', 'test.xml');
const TEST_XML_DATA = readFileSync(TEST_XML_SRC);
const BAR_PUG_SRC = join(__dirname, 'bar.pug');
const BAR_PUG_DATA = readFileSync(BAR_PUG_SRC);

test('transform', t => {
  const out = transform(`
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
  t.truthy(out);

  t.is(out, `\
<!DOCTYPE html>
<html>
  <body>testing two<em>one</em>1one</body>
  <!-- <root>testing <em>one</em> two</root> -->
</html>
`);
});

test('xml', t => {
  const out = transform(`
foot
  = $('em/text()')
`,
  parseXml('<root>testing <em>one</em> two</root>'));
  t.truthy(out);

  t.is(out, `\
<?xml version='1.0'?>
<foot>one</foot>
`);
});

test('defs', t => {
  const out = transform(TEST_PUG_DATA, TEST_XML_DATA, {
    pugFileName: TEST_PUG_SRC,
    xmlFileName: TEST_XML_SRC,
    define: {
      mode: 'defs test',
    },
  });
  t.is(typeof out, 'string');
  t.regex(out, /<span>defs test<\/span>/);
});

test('xformBuffer', t => {
  const buf = Buffer.from('<foo>boo</foo>');
  const out = transform(BAR_PUG_DATA, buf);
  t.is(typeof out, 'string');
});

test('xformDoc', t => {
  const doc = parseXml('<foo>boo</foo>');
  const out = transform(BAR_PUG_DATA, doc);
  t.is(typeof out, 'string');
});

test('edges', t => {
  const doc = parseXml('<foo>boo</foo>');
  t.throws(() => transform(BAR_PUG_DATA, 0));
  let out = transform(BAR_PUG_DATA, doc, {
    pugFileName: 'none',
    xmlFilename: 'none',
  });
  t.is(typeof out, 'string');

  out = transform(BAR_PUG_DATA, Buffer.from('<foo>boo</foo>'), {
    pugFileName: 'none',
    xmlFilename: 'none',
  });
  t.is(typeof out, 'string');
});
