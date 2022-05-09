'use strict'

const url = require('url')
const Dentin = require('dentin')
const xml = require('libxmljs2')
const pug = require('pug')
const state = require('./state')

function prettify(out, options) {
  const dopts = {}
  for (const [k, v] of Object.entries(options)) {
    let found = false
    const nk = k.replace(/^dentin-?(?<firstChar>.)/, (_, firstChar) => {
      found = true
      return firstChar.toLowerCase()
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

/**
 * Configuration options for XmlPug, pug, and dentin.
 *
 * @typedef {object} XmlPugOptions
 * @property {string} [pugFileName='Pug'] The name of the file that the
 *   pugdata came from.  This is used both for generating good errors if
 *   pugdata is a string, as well as resolving "require()", "include", and
 *   "extend" calls in a template.
 * @property {string} [xmlFileName] The name of the XML file the xmldata came
 *   from.  Used for processing Xincludes, etc when xmldata is parsed.
 * @property {string} [pugData] If passed in pugdata is a compiled function
 *   this can be the original text of the template.
 * @property {boolean} [pretty=true] Pretty-print the XML/HTML output using
 *   dentin.
 * @property {boolean} [debug=false] If set to true, the tokens and function
 *   body are logged to stdout.
 * @property {boolean} [compileDebug=true] If set to true, the function source
 *   will be included in the compiled template for better error messages
 *   (sometimes useful in development).
 * @property {boolean} [cache=false] If set to true, compiled functions are
 *   cached. The value of pugFileName will be used as the cache key.
 * @property {boolean} [inlineRuntimeFunctions=false] Inline runtime functions
 *   instead of require-ing them from a shared version.
 * @property {boolean} [html=false] Force HTML output.
 * @property {boolean} [xml=false] Force XML output.
 * @property {boolean} [dentinColors=false] Colorize output with ANSI escapes,
 *   suitable for terminal printing.
 * @property {boolean} [dentinDoubleQuote=false] Use double quotes for
 *   attributes.
 * @property {boolean} [dentinFewerQuotes=false] In HTML docs, only use quotes
 *   around attribute values that require them.
 * @property {string[]} [dentinIgnore=[]] Don't alter whitespace for the text
 *   inside these elements.
 * @property {number} [dentinMargin=78] Line length for word wrapping.
 * @property {boolean} [dentinNoVersion=false] Don't output XML version
 * header.
 * @property {number} [dentinSpaces=2] Number of spaces to indent each level.
 * @property {number} [dentinPeriodSpaces=2] Number of spaces you like after a
 *   period.  I'm old, so it's two by default.
 */

/**
 * Transform an XML document with a pug template.
 *
 * @param {string|Function} pugdata The pug template to use.
 * @param {string|xml.Document} xmldata The XML Document as source.
 * @param {XmlPugOptions} options Configuration.
 * @returns {string} The transformed document.
 */
function transform(pugdata, xmldata, options) {
  options = {
    pretty: true,
    dentinColors: false,
    ...options,
  }

  let pugFunc = null
  if (typeof pugdata === 'function') {
    pugdata = pugFunc
    pugdata = options.pugData
  } else {
    pugFunc = pug.compile(pugdata, {
      ...options,
      pretty: false,
      filename: options.pugFileName,
    })
  }

  let xmldoc = null
  if (xmldata instanceof xml.Document) {
    xmldoc = xmldata
    xmldata = xmldoc.toString()
  } else if (xmldata != null) {
    xmldoc = xml.parseXmlString(xmldata, {
      noent: true,
      baseUrl: options.xmlFileName ?
        url.pathToFileURL(options.xmlFileName).toString() :
        undefined,
    }) // Throws on invalid input
  }
  let out = pugFunc(state(pugdata, xmldata, xmldoc, options))
  if (options.pretty) {
    out = prettify(out, options)
  }
  return out
}

exports.transform = transform
