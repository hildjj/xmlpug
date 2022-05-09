'use strict'

/**
 * Combine multiple objects together, such that child objects and arrays are
 * additive.
 *
 * @param {object[]} args The objects to combine.
 * @returns {object} The combined object.
 * @throws {Error} Unknown type.
 */
function combine(...args) {
  const out = {}
  for (const opts of args) {
    for (const [k, v] of Object.entries(opts)) {
      switch (typeof out[k]) {
        case 'undefined':
        case 'string':
        case 'number':
        case 'boolean':
          out[k] = v
          break
        case 'object':
          if (!out[k]) {
            // It is null
            out[k] = v
            break
          }
          if (Array.isArray(out[k])) {
            out[k] = [...out[k], ...v]
            break
          }
          out[k] = combine(out[k], v)
          break
        default:
          throw new Error(`Unknown type "${typeof out[k]}" for key "${k}"`)
      }
    }
  }
  return out
}
exports.combine = combine
