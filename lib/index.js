(function() {
  var fix, fs, jade, path, pkg, req, temp, transform, xml;

  fs = require('fs');

  xml = require('libxmljs');

  jade = require('jade');

  pkg = require('../package');

  path = require('path');

  temp = require('temp').track();

  req = require;

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
    var cache, fn, xmldoc;
    if (options == null) {
      options = {
        pretty: true
      };
    }
    if (options.xmljadeSource) {
      fn = jade.compileClient(jadedata, options);
      fs.writeFileSync(options.xmljadeSource, fn.toString());
    }
    if (xmldata != null) {
      xmldoc = xml.parseXmlString(xmldata);
      fn = jade.compile(jadedata, options);
      cache = {};
      return fn({
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
        $nsDecls: function(e) {
          var i, len1, n, ns, p, ref, res;
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
          return res;
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
    }
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

  this.cmd = function(args, cb) {
    var commander, len, opts, program;
    commander = require('commander');
    program = new commander.Command;
    program.version(pkg.version).usage('[options] <template> <input>').option('-d, --debug', 'Add Jade debug information').option('-o, --output [file]', 'Output file').option('-p, --pretty', 'Pretty print').option('-s, --source [file]', 'Output source for client transformation').parse(args);
    len = program.args.len;
    if (((program.source != null) && (len < 1)) || (len < 2)) {
      program.help();
    }
    opts = {
      pretty: program.pretty,
      compileDebug: program.debug,
      xmljadeSource: program.source
    };
    return this.transformFile(program.args[0], program.args[1], opts, function(er, output) {
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

}).call(this);

//# sourceMappingURL=index.js.map
