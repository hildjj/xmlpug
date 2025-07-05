import {Document, Element} from 'libxmljs2';
import {name, version} from './version.js';
import {createRequire} from 'node:module';
import path from 'node:path';

/** @typedef {import('libxmljs2').Node} Node */
/** @typedef {import('libxmljs2').Attribute} Attribute */
/** @typedef {import('libxmljs2').Text} Text */
/**
 * Normalize text, numbers, attributes, and text nodes into strings.
 *
 * @param {null|string|number|Text} r Source for normalization.
 * @returns {string|number|null|Node} Normalized value.
 */
function fix(r) {
  if (r == null) {
    return null;
  }

  if ((typeof r === 'string') || (typeof r === 'number')) {
    return r;
  }

  /** @type {Node} */
  const x = r;
  switch (x.type()) {
    case 'attribute':
      return /** @type {Attribute} */(x).value();
    case 'text':
      return /** @type {Text} */(x).text();
    default:
      return x;
  }
}

/**
 * Create the "locals" to pass into the pug render function, containing the
 * new XML functions.
 *
 * @param {string} pugdata The source for the pug template.
 * @param {string} xmldata The source for the XML input.
 * @param {Document} xmldoc The parsed version of the XML input.
 * @param {object} options All of the options used.
 * @returns {object} The locals object.
 */
function state(pugdata, xmldata, xmldoc, options) {
  return {
    pugdata,
    xmldoc,
    opts: options,

    defs: options.define,
    version: `${name} v${version}`,
    $source: xmldata,
    $sourceFile: options.xmlFileName,

    $: function $(q, c, ns) {
      if (q == null) {
        q = '.';
      }
      if (c == null) {
        c = xmldoc;
      }
      if ((c != null) &&
          (ns == null) &&
          (!(c instanceof Document)) &&
          (!(c instanceof Element))) {
        ns = c;
        c = xmldoc;
      }
      return fix(c.get(q, ns));
    },

    $$: function $$(q, c, ns) {
      if (q == null) {
        q = '.';
      }
      if (c == null) {
        c = xmldoc;
      }
      if ((c != null) &&
          (ns == null) &&
          (!(c instanceof Document)) &&
          (!(c instanceof Element))) {
        ns = c;
        c = xmldoc;
      }
      const ref = c.find(q, ns);
      const results = [];
      for (let i = 0, len1 = ref.length; i < len1; i++) {
        const r = ref[i];
        results.push(fix(r));
      }
      return results;
    },

    $att: function $att(e, a) {
      if (e == null) {
        return a;
      }
      // I don't remember why.  typeof(null) == 'object', so ?
      if ((a == null) || (typeof a === 'object')) {
        const all = {};
        const ref = e.attrs();
        for (let i = 0, len1 = ref.length; i < len1; i++) {
          const at = ref[i];
          const v = at.value();
          if (v != null) {
            let n = at.name();
            const ns = at.namespace();
            if ((ns != null) && (ns.prefix() != null)) {
              n = `${ns.prefix()}:${n}`;
            }
            all[n] = v;
          }
        }
        if (a != null) {
          for (const [n, v] of Object.entries(a)) {
            if (v != null) {
              all[n] = v;
            }
          }
        }
        return all;
      }
      return e.attr(a) || undefined;
    },

    $element: function $element(nm, content) {
      return new Element(xmldoc, nm, content);
    },

    $nsDecls: function $nsDecls(e, a) {
      e = e || xmldoc.root();
      const res = {};
      const ref = e.namespaces(true);
      for (let i = 0, len1 = ref.length; i < len1; i++) {
        const ns = ref[i];
        const p = ns.prefix();
        let n = 'xmlns';
        if (p != null) {
          n += `:${p}`;
        }
        res[n] = ns.href();
      }
      if (a != null) {
        for (const [n, v] of Object.entries(a)) {
          if (v != null) {
            res[n] = v;
          }
        }
      }
      return res;
    },

    $qname: function $qname(e) {
      const ns = e.namespace();
      if ((ns != null) && (ns.prefix() != null)) {
        return `${ns.prefix()}:${e.name()}`;
      }
      return e.name();
    },

    $root: function $root() {
      return xmldoc.root();
    },

    require: function require(mod) {
      const fn = options?.pugFileName ? path.resolve(options.pugFileName) : path.join(process.cwd(), 'stdin.pug');
      const req = createRequire(fn);
      return req(mod);
    },
  };
}
export default state;
