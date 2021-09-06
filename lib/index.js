'use strict'

const Dentin = require('dentin')
const xml = require('libxmljs2')
const pug = require('pug')
const state = require('./state')

function prettify(out, options) {
  const dopts = {}
  for (const [k, v] of Object.entries(options)) {
    let found = false
    const nk = k.replace(/^dentin-/, () => {
      found = true
      return ''
    })
    if (found) {
      dopts[nk] = v
    }
  }

  if (dopts.html == null) {
    dopts.html = options.html
  }

  // Override if the output is HTML.  If you wanted XHTML,
  // use the --xml switch.  It's much more likely (today) that if the
  // output is doctype HTML, you wanted HTML5, so we're biased
  // that direction.
  if (!dopts.html &&
      !options.xml &&
      out.match(/^\s*<!DOCTYPE[^>]+html/im)) {
    dopts.html = true
  }

  return Dentin.dent(out, dopts)
}

exports.transform = function transform(pugdata, xmldata, options) {
  options = {
    pretty: true,
    ...options,
    'dentin-colors': false,
  }

  const pugFunc = (typeof pugdata === 'function') ?
    pugdata :
    pug.compile(pugdata, {
      ...options,
      pretty: false,
      filename: options.pugFileName,
    })

  let xmldoc = null
  if (xmldata instanceof xml.Document) {
    xmldoc = xmldata
    xmldata = xmldoc.toString()
  } else if (xmldata != null) {
    xmldoc = xml.parseXmlString(xmldata, {
      noent: true,
    }) // Throws on invalid input
  }
  let out = pugFunc(state(pugdata, xmldata, xmldoc, options))
  if (options.pretty) {
    out = prettify(out, options)
  }
  return out
}

