(function() {
  var DEFAULT_CONFIG, dentToString, fix, fs, jade, path, pkg, req, temp, transform, xml;

  try {
    require('source-map-support').install();
  } catch (_error) {

  }

  fs = require('fs');

  dentToString = require('dentin').dentToString;

  xml = require('libxmljs');

  jade = require('jade');

  pkg = require('../package');

  path = require('path');

  temp = require('temp').track();

  req = require;

  DEFAULT_CONFIG = "./.xmljade.json";

  fix = function(r) {
    var t;
    if (r == null) {
      return r;
    } else {
      t = typeof r;
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
  };

  this.transform = transform = function(jadedata, xmldata, options) {
    var cache, dopts, err, fn, found, k, out, pretty, v, xmldoc, xopts;
    if (options == null) {
      options = {
        pretty: true
      };
    }
    pretty = options.pretty;
    options.pretty = false;
    if (options.xmljadeSource) {
      fn = jade.compileClient(jadedata, options);
      fs.writeFileSync(options.xmljadeSource, fn.toString());
    }
    if (xmldata == null) {
      return null;
    }
    xopts = {};
    if (options.xinclude) {
      xopts.xinclude = true;
      xopts.noxincnode = true;
    }
    xmldoc = xml.parseXmlString(xmldata, xopts);
    if (fn == null) {
      fn = jade.compile(jadedata, options);
    }
    cache = {};
    out = fn({
      $: function(q, c, ns) {
        if (q == null) {
          q = '.';
        }
        if (c == null) {
          c = xmldoc;
        }
        if ((c != null) && (ns == null) && (!(c instanceof xml.Document)) && (!(c instanceof xml.Element))) {
          ns = c;
          c = xmldoc;
        }
        return fix(c.get(q, ns));
      },
      $$: function(q, c, ns) {
        var i, len1, r, ref, results;
        if (q == null) {
          q = '.';
        }
        if (c == null) {
          c = xmldoc;
        }
        if ((c != null) && (ns == null) && (!(c instanceof xml.Document)) && (!(c instanceof xml.Element))) {
          ns = c;
          c = xmldoc;
        }
        ref = c.find(q, ns);
        results = [];
        for (i = 0, len1 = ref.length; i < len1; i++) {
          r = ref[i];
          results.push(fix(r));
        }
        return results;
      },
      $att: function(e, a) {
        var all, at, i, len1, n, ns, ref, ref1, v;
        if (e == null) {
          return null;
        } else if ((a == null) || (typeof a === 'object')) {
          all = {};
          ref = e.attrs();
          for (i = 0, len1 = ref.length; i < len1; i++) {
            at = ref[i];
            v = at.value();
            if (v != null) {
              n = at.name();
              ns = at.namespace();
              if ((ns != null) && (ns.prefix() != null)) {
                n = ns.prefix() + ':' + n;
              }
              all[n] = v;
            }
          }
          if (a != null) {
            for (n in a) {
              v = a[n];
              if (v != null) {
                all[n] = v;
              }
            }
          }
          return all;
        } else {
          return (ref1 = e.attr(a)) != null ? ref1.value() : void 0;
        }
      },
      $nsDecls: function(e, a) {
        var i, len1, n, ns, p, ref, res, v;
        e = e || xmldoc.root();
        res = {};
        ref = e.nsDecls();
        for (i = 0, len1 = ref.length; i < len1; i++) {
          ns = ref[i];
          n = 'xmlns';
          p = ns.prefix();
          if (p != null) {
            n += ':' + p;
          }
          res[n] = ns.href();
        }
        if (a != null) {
          for (n in a) {
            v = a[n];
            if (v != null) {
              res[n] = v;
            }
          }
        }
        return res;
      },
      $qname: function(e) {
        var ns;
        ns = e.namespace();
        if ((ns != null) && (ns.prefix() != null)) {
          return ns.prefix() + ":" + e.name();
        } else {
          return e.name();
        }
      },
      $root: function() {
        return xmldoc.root();
      },
      $source: xmldata,
      require: function(mod) {
        var dir, m, pth, tmp;
        m = cache[mod];
        if (m == null) {
          dir = null;
          if (options.filename != null) {
            dir = path.dirname(options.filename);
          }
          tmp = temp.openSync({
            dir: dir,
            suffix: ".js"
          });
          fs.writeSync(tmp.fd, "module.exports = require('" + mod + "');\n");
          fs.closeSync(tmp.fd);
          pth = path.resolve(process.cwd(), tmp.path);
          m = req(pth);
          cache[mod] = m;
          setImmediate(function() {
            return fs.unlinkSync(pth);
          });
        }
        return m;
      },
      version: pkg.name + " v" + pkg.version
    });
    if (pretty) {
      dopts = {};
      for (k in options) {
        v = options[k];
        found = false;
        k = k.replace(/^dentin-/, function() {
          found = true;
          return "";
        });
        if (found) {
          dopts[k] = v;
        }
      }
      if (dopts.html == null) {
        dopts.html = options.html;
      }
      try {
        out = dentToString(out, dopts);
      } catch (_error) {
        err = _error;
        process.stderr.write("Problem parsing output for pretty printing: " + err.message);
      }
    }
    return out;
  };

  this.transformFile = function(jade, xml, options, cb) {
    var ref;
    if (options == null) {
      options = {
        pretty: true
      };
    }
    if (typeof options === 'function') {
      ref = [options, {}], cb = ref[0], options = ref[1];
    }
    if (cb == null) {
      cb = function() {};
    }
    return fs.readFile(jade, function(err, jadedata) {
      if (err != null) {
        return cb(err);
      }
      if (xml != null) {
        if (xml === '-') {
          xml = '/dev/stdin';
        }
        return fs.readFile(xml, function(err, xmldata) {
          if (err != null) {
            return cb(err);
          }
          options.filename = jade;
          return cb(null, transform(jadedata, xmldata, options));
        });
      } else {
        return cb(null, transform(jadedata, null, options));
      }
    });
  };

  this.read_config = function(opts, cb) {
    var cfg, ref;
    if (opts == null) {
      opts = {};
    }
    cfg = (ref = opts.config) != null ? ref : DEFAULT_CONFIG;
    if (cfg == null) {
      return cb(null, opts);
    }
    return fs.exists(cfg, function(exists) {
      if (!exists) {
        return cb(null, opts);
      }
      return fs.readFile(cfg, function(err, data) {
        var config, er, k, v;
        if (err != null) {
          return cb(err);
        }
        try {
          config = JSON.parse(data);
          for (k in config) {
            v = config[k];
            if (opts[k] == null) {
              opts[k] = v;
            }
          }
          return cb(null, opts);
        } catch (_error) {
          er = _error;
          return cb(er);
        }
      });
    });
  };

  this.cmd = function(args, cb) {
    var commander, len, opts, program;
    commander = require('commander');
    program = new commander.Command;
    program.version(pkg.version).usage('[options] <template> [input]').option('-c, --config <file>', "Config file to read [" + DEFAULT_CONFIG + "]", DEFAULT_CONFIG).option('-d, --debug', 'Add Jade debug information').option('-i, --xinclude', 'Process XInclude when parsing XML').option('-o, --output [file]', 'Output file').option('-p, --pretty', 'Pretty print').option('--html', 'HTML output; only useful for pretty printing').option('-s, --source [file]', 'Output source for client transformation').parse(args);
    len = program.args.len;
    if (((program.source != null) && (len < 1)) || (len < 2)) {
      program.help();
    }
    if (program.args.length < 1) {
      program.help();
    }
    opts = {
      pretty: program.pretty,
      compileDebug: program.debug,
      xmljadeSource: program.source,
      config: program.config,
      xinclude: program.xinclude,
      html: false
    };
    if (program.html || ((program.output != null) && program.output.match(/\.html?$/))) {
      opts.html = true;
    }
    return this.read_config(opts, (function(_this) {
      return function(er) {
        if (er != null) {
          return process.stderr.write(program.config + ": " + er.message + "\n");
        }
        return _this.transformFile(program.args[0], program.args[1], opts, function(er, output) {
          if (er != null) {
            return cb(er);
          }
          if (program.output != null) {
            return fs.writeFile(program.output, output, function(er) {
              if (er != null) {
                return cb(er);
              }
              return cb(null, output);
            });
          } else {
            if (output != null) {
              console.log(output);
            }
            return cb(null, output);
          }
        });
      };
    })(this));
  };

}).call(this);

//# sourceMappingURL=index.js.map
