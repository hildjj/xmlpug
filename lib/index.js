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
    switch (r.type()) {
      case 'attribute':
        return r.value();
      case 'text':
        return r.text();
      default:
        return r;
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
        $: function(q, c) {
          if (c == null) {
            c = xmldoc;
          }
          return fix(c.get(q));
        },
        $$: function(q, c) {
          var r, _i, _len, _ref, _results;
          if (c == null) {
            c = xmldoc;
          }
          _ref = c.find(q);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            r = _ref[_i];
            _results.push(fix(r));
          }
          return _results;
        },
        $att: function(e, a) {
          var all, _i, _len, _ref, _ref1;
          if (e == null) {
            return null;
          } else if (a == null) {
            all = {};
            _ref = e.attrs();
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              a = _ref[_i];
              all[a.name()] = a.value();
            }
            return all;
          } else {
            return (_ref1 = e.attr(a)) != null ? _ref1.value() : void 0;
          }
        },
        $root: function() {
          return xmldoc.root();
        },
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
          }
          return m;
        },
        version: "" + pkg.name + " v" + pkg.version
      });
    }
  };

  this.transformFile = function(jade, xml, options, cb) {
    var _ref;
    if (options == null) {
      options = {
        pretty: true
      };
    }
    if (typeof options === 'function') {
      _ref = [options, {}], cb = _ref[0], options = _ref[1];
    }
    if (cb == null) {
      cb = function() {};
    }
    return fs.readFile(jade, function(err, jadedata) {
      if (err != null) {
        return cb(err);
      }
      if (xml != null) {
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
