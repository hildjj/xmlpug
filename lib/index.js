'use strict'

const fs = require('fs').promises
const Dentin = require('dentin')
const xml = require('libxmljs2')
const pug = require('pug')
const {Buffer} = require('buffer')

const cache = require('./cache')
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

  const {pretty} = options
  options.pretty = false
  const pugFunc = (typeof pugdata === 'function') ?
    pugdata :
    pug.compile(pugdata, options)

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
  if (pretty) {
    out = prettify(out, options)
  }
  return out
}

async function transformFile(pugFileName, xmlDoc, options) {
  if (options == null) {
    options = {
      pretty: true,
    }
  }
  if (options.pugFileName == null) {
    options.pugFileName = pugFileName
  }
  options.filename = options.pugFileName

  switch (typeof xmlDoc) {
    case 'string':
      options.xmlFileName = options.xmlFileName || xmlDoc
      if (xmlDoc === '-') {
        xmlDoc = new Promise((res, rej) => {
          const bufs = []
          process.stdin.on('data', buf => bufs.push(buf))
          process.stdin.on('end', () => res(Buffer.concat(bufs)))
          process.stdin.on('error', rej)
        })
      } else {
        xmlDoc = fs.readFile(xmlDoc)
      }
      break
    case 'object':
      // Maybe null is ok.  It will cause other issues downstream.
      if (!options.xmlFilename) {
        if (Buffer.isBuffer(xmlDoc)) {
          options.xmlFileName = 'Buffer'
        } else if (xmlDoc instanceof xml.Document) {
          options.xmlFileName = 'xmlDocument'
        }
      }
      break
    default:
      throw new Error('Invalid XML input', typeof xmlDoc)
  }

  const [pfunc, xdata] = await Promise.all([
    cache.read(pugFileName, pugdata => pug.compile(pugdata, options)),
    xmlDoc,
  ])
  return exports.transform(pfunc, xdata, options)
}

exports.transformFile = transformFile
