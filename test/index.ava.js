'use strict'

const test = require('ava')
const xmlpug = require('../lib/index')
const xml = require('libxmljs2')
const path = require('path')
const {Buffer} = require('buffer')

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

test('transformFile', async t => {
  const pug = path.join(__dirname, '..', 'examples', 'test.pug')
  const xmlOut = path.join(__dirname, '..', 'examples', 'test.xml')
  const out = await xmlpug.transformFile(pug, xmlOut, {
    define: {
      mode: 'nodeunit transformFile',
    },
  })
  t.truthy(out)
})

test('xformBuffer', async t => {
  const buf = Buffer.from('<foo>boo</foo>')
  const pug = path.join(__dirname, 'bar.pug')
  const out = await xmlpug.transformFile(pug, buf)
  t.truthy(out)
})

test('xformDoc', async t => {
  const doc = xml.parseXml('<foo>boo</foo>')
  const pug = path.join(__dirname, 'bar.pug')
  const out = await xmlpug.transformFile(pug, doc)
  t.truthy(out)
})

test('edges', async t => {
  const doc = xml.parseXml('<foo>boo</foo>')
  const pug = path.join(__dirname, 'bar.pug')
  t.throwsAsync(() => xmlpug.transformFile(pug, 0))
  let out = await xmlpug.transformFile(pug, doc, {
    pugFileName: 'none',
    xmlFilename: 'none',
  })
  t.truthy(out)

  out = await xmlpug.transformFile(pug, Buffer.from('<foo>boo</foo>'), {
    pugFileName: 'none',
    xmlFilename: 'none',
  })
  t.truthy(out)
})
