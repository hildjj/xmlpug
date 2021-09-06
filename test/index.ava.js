'use strict'

const {Buffer} = require('buffer')
const fs = require('fs')
const path = require('path')
const test = require('ava')
const xml = require('libxmljs2')
const xmlpug = require('../lib/index')

const TEST_PUG_SRC = path.join(__dirname, '..', 'examples', 'test.pug')
const TEST_PUG_DATA = fs.readFileSync(TEST_PUG_SRC)
const TEST_XML_SRC = path.join(__dirname, '..', 'examples', 'test.xml')
const TEST_XML_DATA = fs.readFileSync(TEST_XML_SRC)
const BAR_PUG_SRC = path.join(__dirname, 'bar.pug')
const BAR_PUG_DATA = fs.readFileSync(BAR_PUG_SRC)

test('transform', t => {
  t.truthy(xmlpug)

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
  '<root>testing <em>one</em> two</root>')
  t.truthy(out)

  t.deepEqual(out, `\
<!DOCTYPE html>
<html>
  <body>testing two<em>one</em>1one</body>
  <!-- <root>testing <em>one</em> two</root> -->
</html>
`)
})

test('xml', t => {
  const out = xmlpug.transform(`
foot
  = $('em/text()')
`,
  xml.parseXml('<root>testing <em>one</em> two</root>'))
  t.truthy(out)

  t.deepEqual(out, `\
<?xml version='1.0'?>
<foot>one</foot>
`)
})

test('defs', t => {
  const out = xmlpug.transform(TEST_PUG_DATA, TEST_XML_DATA, {
    pugFileName: TEST_PUG_SRC,
    xmlFileName: TEST_XML_SRC,
    define: {
      mode: 'defs test',
    },
  })
  t.is(typeof out, 'string')
  t.regex(out, /<span>defs test<\/span>/)
})

test('xformBuffer', t => {
  const buf = Buffer.from('<foo>boo</foo>')
  const out = xmlpug.transform(BAR_PUG_DATA, buf)
  t.is(typeof out, 'string')
})

test('xformDoc', t => {
  const doc = xml.parseXml('<foo>boo</foo>')
  const out = xmlpug.transform(BAR_PUG_DATA, doc)
  t.is(typeof out, 'string')
})

test('edges', t => {
  const doc = xml.parseXml('<foo>boo</foo>')
  t.throws(() => xmlpug.transform(BAR_PUG_DATA, 0))
  let out = xmlpug.transform(BAR_PUG_DATA, doc, {
    pugFileName: 'none',
    xmlFilename: 'none',
  })
  t.is(typeof out, 'string')

  out = xmlpug.transform(BAR_PUG_DATA, Buffer.from('<foo>boo</foo>'), {
    pugFileName: 'none',
    xmlFilename: 'none',
  })
  t.is(typeof out, 'string')
})
