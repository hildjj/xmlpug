'use strict';

const xml = require('libxmljs');
const State = require('../lib/state');

exports.corners = function(test) {
  const src =
`<foo>
  <bar/>
  <bar/>
  <baz xmlns="urn:baz" xmlns:b="urn:b" b:b="bb" c="">
    <b:boo/>
  </baz>
</foo>`;
  const doc = xml.parseXml(src);
  const s = State('html', src, doc, {});
  test.ok(s);
  test.ok(s.version);
  test.ok(s.$('/foo'));
  test.equals(s.$().toString(), src);
  test.equals(s.$$('bar').length, 2);
  test.equals(s.$$().length, 1);
  test.equals(s.$att(), null);
  test.equals(s.$element('foo', 'bar').toString(), '<foo>bar</foo>');
  const baz = s.$('u:baz', {u:'urn:baz'});
  test.ok(baz);
  test.ok(!s.$att(baz, 'xmlns'));
  test.deepEqual(s.$att(baz, {b: 'nope', c:null}), {
    'b:b': 'bb',
    b: 'nope',
    c: ''
  });
  test.deepEqual(s.$nsDecls(), {});
  test.deepEqual(s.$nsDecls(baz, {boo: 'urn:boo', c: null}), {
    xmlns: 'urn:baz',
    'xmlns:b': 'urn:b',
    boo: 'urn:boo'
  });
  test.equals(s.$qname(baz), 'baz');
  test.equals(s.$qname(s.$('c:boo', baz, {c: 'urn:b'})), 'b:boo');
  test.equals(typeof s.require('../examples/test.js').stuff, 'function');
  test.done();
};
