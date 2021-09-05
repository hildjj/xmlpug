'use strict'

const xml = require('libxmljs2')
const xmlpug = require('../lib/index')
const path = require('path')
const {Buffer} = require('buffer')

exports.transform = test => {
  test.ok(xmlpug != null)
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
  test.ok(out)

  test.deepEqual(out, `\
<!DOCTYPE html>
<html>
  <body>testing two<em>one</em>1one</body>
  <!-- <root>testing <em>one</em> two</root> -->
</html>
`)
  test.done()
}

exports.xml = test => {
  test.ok(xmlpug != null)
  const out = xmlpug.transform(`
foot
  = $('em/text()')
`,
  xml.parseXml('<root>testing <em>one</em> two</root>'))
  test.ok(out)

  test.deepEqual(out, `\
<?xml version='1.0'?>
<foot>one</foot>
`)
  test.done()
}

exports.transformFile = async test => {
  const pug = path.join(__dirname, '..', 'examples', 'test.pug')
  const xmlOut = path.join(__dirname, '..', 'examples', 'test.xml')
  const out = await xmlpug.transformFile(pug, xmlOut, {
    define: {
      mode: 'nodeunit transformFile',
    },
  })
  test.ok(out)
  test.done()
}

exports.xformBuffer = async test => {
  const buf = Buffer.from('<foo>boo</foo>')
  const pug = path.join(__dirname, 'bar.pug')
  const out = await xmlpug.transformFile(pug, buf)
  test.ok(out)
  test.done()
}

exports.xformDoc = async test => {
  const doc = xml.parseXml('<foo>boo</foo>')
  const pug = path.join(__dirname, 'bar.pug')
  const out = await xmlpug.transformFile(pug, doc)
  test.ok(out)
  test.done()
}

exports.edges = async test => {
  const doc = xml.parseXml('<foo>boo</foo>')
  const pug = path.join(__dirname, 'bar.pug')
  test.throws(() => xmlpug.transformFile(pug, 0))
  let out = await xmlpug.transformFile(pug, doc, {
    pugFileName: 'none',
    xmlFilename: 'none',
  })
  test.ok(out)

  out = await xmlpug.transformFile(pug, Buffer.from('<foo>boo</foo>'), {
    pugFileName: 'none',
    xmlFilename: 'none',
  })
  test.ok(out)
  test.done()
}

