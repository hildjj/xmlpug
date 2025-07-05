import {combine} from '../lib/utils.js';
import test from 'ava';

test('combine', t => {
  t.throws(() => combine({a: Symbol('a')}, {a: 'a'}));
});
