'use strict'

const test = require('ava')
const {combine} = require('../lib/utils')

test('combine', t => {
  t.throws(() => combine({a: Symbol('a')}, {a: 'a'}))
})
