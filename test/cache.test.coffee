cache = require '../lib/cache'

@tearDown = (cb) ->
  cache.clear()
  cb()

@read = (test) ->
  cache.read __filename
  .then (buf1) ->
    cache.read __filename
    .then (buf2) ->
      test.equals buf1, buf2
      test.done()

@readFail = (test) ->
  cache.read __filename + "_booga"
  .catch (e) ->
    test.ok e?
    cache.read(null)
    .then (e) ->
      test.ok !e?
      test.done()

@readXform = (test) ->
  cache.read __filename, (buf) ->
    buf.toString()
  .then (buf1) ->
    cache.read __filename
    .then (s) ->
      test.equals buf1, s
      test.done()

@readSync = (test) ->
  buf1 = cache.readSync __filename
  buf2 = cache.readSync __filename
  test.equals buf1, buf2
  test.done()

@readSyncFail = (test) ->
  test.throws ->
    cache.readSync null
  test.throws ->
    cache.readSync __filename + "_booga"
  test.done()

@readSyncXform = (test) ->
  buf1 = cache.readSync __filename, (buf) ->
    buf.toString()
  buf2 = cache.readSync __filename
  test.equals buf1, buf2
  test.done()