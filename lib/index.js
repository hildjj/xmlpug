'use strict';
const bb = require('bluebird');
const fs = bb.promisifyAll(require('fs'));
const dentToString = require('dentin').dentToString;
const xml = require('libxmljs');
const pug = require('pug');
const pkg = require('../package');
const path = require('path');
const resolve = require('resolve');
const cache = require('./cache');
const req = require;
const DEFAULT_CONFIG = './.xmlpug.json';

function fix(r) {
  if (r == null) {
    return r;
  } else {
    const t = typeof r;
    if (t === 'string' || t === 'number') {
      return r;
    } else {
      switch (r.type()) {
        case 'attribute':
          return r.value();
        case 'text':
          return r.text();
        default:
          return r;
      }
    }
  }
}

function compilePug(pugdata, options) {
  if (options == null) {
    options = {};
  }
  if (typeof pugdata === 'function') {
    return bb.resolve(pugdata);
  }
  return bb.try(() => {
    if (options.xmlpugSource) {
      const fn = pug.compileClient(pugdata, options);
      return fs.writeFileAsync(options.xmlpugSource, fn.toString());
    }
  }).then(() => {
    return pug.compile(pugdata, options);
  });
}

exports.transform = function transform(pugdata, xmldata, options) {
  if (options == null) {
    options = {
      pretty: true
    };
  }
  const pretty = options.pretty;
  options.pretty = false;
  return compilePug(pugdata, options).then(function(pugFunc) {
    let xmldoc = null;
    if (xmldata instanceof xml.Document) {
      xmldoc = xmldata;
      xmldata = xmldoc.toString();
    } else {
      xmldoc = xml.parseXmlString(xmldata, {
        noent: true
      }); // throws on invalid input
    }
    let out = pugFunc({
      defs: options.define,
      $: function(q, c, ns) {
        if (q == null) {
          q = '.';
        }
        if (c == null) {
          c = xmldoc;
        }
        if ((c != null) &&
            (ns == null) &&
            (!(c instanceof xml.Document)) &&
            (!(c instanceof xml.Element))) {
          ns = c;
          c = xmldoc;
        }
        return fix(c.get(q, ns));
      },
      $$: function(q, c, ns) {
        if (q == null) {
          q = '.';
        }
        if (c == null) {
          c = xmldoc;
        }
        if ((c != null) &&
            (ns == null) &&
            (!(c instanceof xml.Document)) &&
            (!(c instanceof xml.Element))) {
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
      $att: function(e, a) {
        if (e == null) {
          return null;
        } else if ((a == null) || (typeof a === 'object')) {
          const all = {};
          const ref = e.attrs();
          for (let i = 0, len1 = ref.length; i < len1; i++) {
            const at = ref[i];
            const v = at.value();
            if (v != null) {
              let n = at.name();
              const ns = at.namespace();
              if ((ns != null) && (ns.prefix() != null)) {
                n = ns.prefix() + ':' + n;
              }
              all[n] = v;
            }
          }
          if (a != null) {
            for (const n in a) {
              const v = a[n];
              if (v != null) {
                all[n] = v;
              }
            }
          }
          return all;
        } else {
          return e.attr(a) || undefined;
        }
      },
      $element: function(name, content) {
        return new xml.Element(xmldoc, name, content);
      },
      $nsDecls: function(e, a) {
        e = e || xmldoc.root();
        const res = {};
        const ref = e.namespaces(true);
        for (let i = 0, len1 = ref.length; i < len1; i++) {
          const ns = ref[i];
          const p = ns.prefix();
          let n = 'xmlns';
          if (p != null) {
            n += ':' + p;
          }
          res[n] = ns.href();
        }
        if (a != null) {
          for (const n in a) {
            const v = a[n];
            if (v != null) {
              res[n] = v;
            }
          }
        }
        return res;
      },
      $qname: function(e) {
        const ns = e.namespace();
        if ((ns != null) && (ns.prefix() != null)) {
          return ns.prefix() + ':' + e.name();
        } else {
          return e.name();
        }
      },
      $root: function() {
        return xmldoc.root();
      },
      $source: xmldata,
      $sourceFile: options.xmlFileName,
      require: function(mod) {
        const dn = options.pugFileName ?
          path.dirname(options.pugFileName) : __dirname;
        const fileName = resolve.sync(mod, {
          basedir: dn
        });
        return req(fileName);
      },
      version: pkg.name + ' v' + pkg.version
    });
    if (pretty) {
      const dopts = {};
      for (let k in options) {
        const v = options[k];
        let found = false;
        k = k.replace(/^dentin-/, function() {
          found = true;
          return '';
        });
        if (found) {
          dopts[k] = v;
        }
      }
      if (dopts.html == null) {
        dopts.html = options.html;
      }
      out = dentToString(out, dopts);
    }
    return out;
  });
};

exports.transformFile = function transformFile(pugFileName, xml, options) {
  if (options == null) {
    options = {
      pretty: true
    };
  }
  if (options.pugFileName == null) {
    options.pugFileName = pugFileName;
  }
  options.filename = options.pugFileName;
  return bb.all([
    cache.read(pugFileName, function(pugdata) {
      return compilePug(pugdata, options);
    }), (function() {
      switch (false) {
        case xml !== null:
          return null;
        case !Buffer.isBuffer(xml):
          if (options.xmlFileName == null) {
            options.xmlFileName = 'Buffer';
          }
          return xml;
        default:
          if (xml === '-') {
            xml = '/dev/stdin';
          }
          options.xmlFileName = xml;
          return cache.read(xml);
      }
    })()
  ]).then(function([pugFunc, xmlData]) {
    if (xmlData) {
      return exports.transform(pugFunc, xmlData, options);
    }
  });
};

exports.readConfig = function readConfig(opts) {
  if (opts == null) {
    opts = {};
  }
  const ref = opts.config || DEFAULT_CONFIG;
  return fs.readFileAsync(ref).then(function(data) {
    return Object.assign(opts, JSON.parse(data));
  }).catchReturn(opts);
};
// Backwards-compat:
exports.read_config = exports.readConfig; // eslint-disable-line camelcase

exports.cmd = function cmd(args) {
  const defs = {};
  function define(v) {
    const m = v.match(/([^=]+)\s*=\s*(.*)/);
    if (!m) {
      return console.error('Invalid definition: \'' + v + '\'');
    } else {
      return defs[m[1]] = m[2];
    }
  }
  const commander = require('commander');
  const program = new commander.Command;
  program
    .version(pkg.version)
    .usage('[options] <template> [input]')
    .option('-c, --config <file>',
            'Config file to read [' + DEFAULT_CONFIG + ']',
            DEFAULT_CONFIG)
    .option('-d, --debug', 'Add Pug debug information')
    .option('-D, --define [name=string]', 'Define a global variable', define)
    .option('--doublequote', 'Use doublequotes instead of single')
    .option('-o, --output [file]', 'Output file')
    .option('-p, --pretty', 'Pretty print')
    .option('--html', 'HTML output; only useful for pretty printing')
    .option('-s, --source [file]', 'Output source for client transformation')
    .parse(args);
  const len = program.args.len;
  if (((program.source != null) && (len < 1)) || (len < 2)) {
    program.help();
  }
  if (program.args.length < 1) {
    program.help();
  }
  const opts = {
    pretty: program.pretty,
    compileDebug: program.debug,
    xmlpugSource: program.source,
    config: program.config,
    html: false,
    'dentin-doublequote': program.doublequote
  };
  if (program.html ||
      ((program.output != null) &&
       program.output.match(/\.html?$/))) {
    opts.html = true;
  }
  return this.read_config(opts).then(function(opts) {
    if (opts.define != null) {
      opts.define = Object.assign(defs, opts.define);
    } else {
      opts.define = defs;
    }
    return exports.transformFile(program.args[0], program.args[1], opts);
  }).then(function(output) {
    if (output == null) {
      return;
    }
    if (program.output != null) {
      return fs.writeFileAsync(program.output, output).thenReturn(output);
    } else {
      console.log(output);
      return output;
    }
  });
};
