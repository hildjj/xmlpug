bb = require 'bluebird'
fs = bb.promisifyAll(require 'fs')

cache = {}

@read = (filename, xform) ->
  return bb.resolve(null) unless filename?
  last = cache[filename]
  return bb.resolve(last) if last?
  fs.readFileAsync filename
  .then (last) ->
    if xform?
      xform last
    else
      last
  .then (last) ->
    cache[filename] = last

@readSync = (filename, xform) ->
  unless filename?
    throw new Error('filename required')
  last = cache[filename]
  return last if last?
  last = fs.readFileSync filename
  cache[filename] = if xform?
    xform last
  else
    last

@clear = ->
  cache = {}