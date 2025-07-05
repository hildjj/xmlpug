import {fileURLToPath} from 'node:url';
import {parseXml} from 'libxmljs2';
import state from '../lib/state.js';
import test from 'ava';

test('corners', t => {
  const src =
`<foo>
  <bar/>
  <bar/>
  <baz xmlns="urn:baz" xmlns:b="urn:b" b:b="bb" c="">
    <b:boo/>
  </baz>
</foo>`;
  const doc = parseXml(src);
  const s = state('html', src, doc, {
    pugFileName: fileURLToPath(import.meta.url),
  });
  t.truthy(s);
  t.truthy(s.version);
  t.truthy(s.$('/foo'));
  t.is(s.$().toString(), src);
  t.is(s.$$('bar').length, 2);
  t.is(s.$$().length, 1);
  t.is(s.$att(), undefined);
  t.is(s.$element('foo', 'bar').toString(), '<foo>bar</foo>');
  const baz = s.$('u:baz', {u: 'urn:baz'});
  t.truthy(baz);
  t.truthy(!s.$att(baz, 'xmlns'));
  t.deepEqual(s.$att(baz, {b: 'nope', c: null}), {
    'b:b': 'bb',
    'b': 'nope',
    'c': '',
  });
  t.deepEqual(s.$nsDecls(), {});
  t.deepEqual(s.$nsDecls(baz, {boo: 'urn:boo', c: null}), {
    'xmlns': 'urn:baz',
    'xmlns:b': 'urn:b',
    'boo': 'urn:boo',
  });
  t.is(s.$qname(baz), 'baz');
  t.is(s.$qname(s.$('c:boo', baz, {c: 'urn:b'})), 'b:boo');
  t.is(typeof s.require('../examples/test.cjs').stuff, 'function');
});
