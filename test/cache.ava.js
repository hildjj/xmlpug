'use strict'

const cache = require('../lib/cache')
const test = require('ava')

test.afterEach.always(t => {
  cache.clear()
})

test('read', async t => {
  const buf1 = await cache.read(__filename)
  const buf2 = await cache.read(__filename)
  t.deepEqual(buf1, buf2)
})

test('readFail', async t => {
  await t.throwsAsync(() => cache.read(`${__filename}_DOES_NOT_EXIST`))
  t.is(await cache.read(null), null)
})

test('readXform', async t => {
  const s1 = await cache.read(__filename, buf => buf.toString())
  t.is(typeof s1, 'string')
  const s2 = await cache.read(__filename)
  t.is(s1, s2)
})

test('readSync', t => {
  const buf1 = cache.readSync(__filename)
  const buf2 = cache.readSync(__filename)
  t.is(buf1, buf2)
})

test('readSyncFail', t => {
  t.throws(() => cache.readSync(null))
  t.throws(() => cache.readSync(`${__filename}_DOES_NOT_EXIST`))
})

test('readSyncXform', t => {
  const buf1 = cache.readSync(__filename, buf => buf.toString())
  const buf2 = cache.readSync(__filename)
  t.is(buf1, buf2)
})
