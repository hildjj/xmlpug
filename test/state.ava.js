'use strict'

const test = require('ava')
const state = require('../lib/state')
const xml = require('libxmljs2')

test('corners', t => {
  const src =
`<foo>
  <bar/>
  <bar/>
  <baz xmlns="urn:baz" xmlns:b="urn:b" b:b="bb" c="">
    <b:boo/>
  </baz>
</foo>`
  const doc = xml.parseXml(src)
  const s = state('html', src, doc, {})
  t.truthy(s)
  t.truthy(s.version)
  t.truthy(s.$('/foo'))
  t.is(s.$().toString(), src)
  t.is(s.$$('bar').length, 2)
  t.is(s.$$().length, 1)
  t.is(s.$att(), undefined)
  t.is(s.$element('foo', 'bar').toString(), '<foo>bar</foo>')
  const baz = s.$('u:baz', {u: 'urn:baz'})
  t.truthy(baz)
  t.truthy(!s.$att(baz, 'xmlns'))
  t.deepEqual(s.$att(baz, {b: 'nope', c: null}), {
    'b:b': 'bb',
    b: 'nope',
    c: '',
  })
  t.deepEqual(s.$nsDecls(), {})
  t.deepEqual(s.$nsDecls(baz, {boo: 'urn:boo', c: null}), {
    xmlns: 'urn:baz',
    'xmlns:b': 'urn:b',
    boo: 'urn:boo',
  })
  t.is(s.$qname(baz), 'baz')
  t.is(s.$qname(s.$('c:boo', baz, {c: 'urn:b'})), 'b:boo')
  t.is(typeof s.require('../examples/test.js').stuff, 'function')
})
