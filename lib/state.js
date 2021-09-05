'use strict'

const path = require('path')
const resolve = require('resolve')
const xml = require('libxmljs2')
const pkg = require('../package')
const req = require

function fix(r) {
  if (r == null) {
    return r
  }

  const t = typeof r
  if (t === 'string' || t === 'number') {
    return r
  }

  switch (r.type()) {
    case 'attribute':
      return r.value()
    case 'text':
      return r.text()
    default:
      return r
  }
}

module.exports = function State(pugdata, xmldata, xmldoc, options) {
  return {
    pugdata,
    xmldoc,
    opts: options,

    defs: options.define,
    version: `${pkg.name} v${pkg.version}`,
    $source: xmldata,
    $sourceFile: options.xmlFileName,

    $: function $(q, c, ns) {
      if (q == null) {
        q = '.'
      }
      if (c == null) {
        c = xmldoc
      }
      if ((c != null) &&
          (ns == null) &&
          (!(c instanceof xml.Document)) &&
          (!(c instanceof xml.Element))) {
        ns = c
        c = xmldoc
      }
      return fix(c.get(q, ns))
    },

    $$: function $$(q, c, ns) {
      if (q == null) {
        q = '.'
      }
      if (c == null) {
        c = xmldoc
      }
      if ((c != null) &&
          (ns == null) &&
          (!(c instanceof xml.Document)) &&
          (!(c instanceof xml.Element))) {
        ns = c
        c = xmldoc
      }
      const ref = c.find(q, ns)
      const results = []
      for (let i = 0, len1 = ref.length; i < len1; i++) {
        const r = ref[i]
        results.push(fix(r))
      }
      return results
    },

    $att: function $att(e, a) {
      if (e == null) {
        return a
      }
      // I don't remember why.  typeof(null) == 'object', so ?
      if ((a == null) || (typeof a === 'object')) {
        const all = {}
        const ref = e.attrs()
        for (let i = 0, len1 = ref.length; i < len1; i++) {
          const at = ref[i]
          const v = at.value()
          if (v != null) {
            let n = at.name()
            const ns = at.namespace()
            if ((ns != null) && (ns.prefix() != null)) {
              n = `${ns.prefix()}:${n}`
            }
            all[n] = v
          }
        }
        if (a != null) {
          for (const [n, v] of Object.entries(a)) {
            if (v != null) {
              all[n] = v
            }
          }
        }
        return all
      }
      return e.attr(a) || undefined
    },

    $element: function $element(name, content) {
      return new xml.Element(xmldoc, name, content)
    },

    $nsDecls: function $nsDecls(e, a) {
      e = e || xmldoc.root()
      const res = {}
      const ref = e.namespaces(true)
      for (let i = 0, len1 = ref.length; i < len1; i++) {
        const ns = ref[i]
        const p = ns.prefix()
        let n = 'xmlns'
        if (p != null) {
          n += `:${p}`
        }
        res[n] = ns.href()
      }
      if (a != null) {
        for (const [n, v] of Object.entries(a)) {
          if (v != null) {
            res[n] = v
          }
        }
      }
      return res
    },

    $qname: function $qname(e) {
      const ns = e.namespace()
      if ((ns != null) && (ns.prefix() != null)) {
        return `${ns.prefix()}:${e.name()}`
      }
      return e.name()
    },

    $root: function $root() {
      return xmldoc.root()
    },

    require: function require(mod) {
      const dn = options.pugFileName ?
        path.dirname(options.pugFileName) :
        __dirname
      const fileName = resolve.sync(mod, {
        basedir: dn,
      })
      return req(fileName)
    },
  }
}
