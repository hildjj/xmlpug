(function() {
  var fix, fs, jade, slg, xml;

  fs = require('fs');

  xml = require('libxmljs');

  jade = require('jade');

  slg = require('slug');

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

  fs.readFile(__dirname + '/p', function(err, data) {
    var doc, fn;
    if (err != null) {
      return console.log(err);
    } else {
      doc = xml.parseXmlString(data);
      doc.toString();
      fn = jade.compileFile('test.jade', {
        pretty: true
      });
      return console.log(fn({
        $: function(q, c) {
          if (c == null) {
            c = doc;
          }
          return fix(c.get(q));
        },
        $$: function(q, c) {
          var r, _i, _len, _ref, _results;
          if (c == null) {
            c = doc;
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
          var _ref;
          return e != null ? (_ref = e.attr(a)) != null ? _ref.value() : void 0 : void 0;
        },
        slug: function(s) {
          if (s != null) {
            return slg(s).toLowerCase();
          } else {
            return null;
          }
        },
        version: 'xml2rfc.jade v0.0.1'
      }));
    }
  });

}).call(this);
