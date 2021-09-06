'use strict'

const fs = require('fs')
let cache = {}

exports.read = async function read(filename, xform) {
  if (filename == null) {
    return null
  }
  let last = cache[filename]
  if (last != null) {
    return last
  }
  last = await fs.promises.readFile(filename)
  if (xform != null) {
    last = xform(last)
  }
  // eslint-disable-next-line require-atomic-updates
  cache[filename] = last
  return last
}

exports.readSync = function readSync(filename, xform) {
  let last = null
  if (filename == null) {
    throw new Error('filename required')
  }
  last = cache[filename]
  if (last != null) {
    return last
  }
  last = fs.readFileSync(filename)
  if (typeof xform === 'function') {
    last = xform(last)
  }
  cache[filename] = last
  return last
}

exports.clear = function clear() {
  cache = {}
  return cache
}
