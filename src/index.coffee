fs = require 'fs'
xml = require 'libxmljs'
jade = require 'jade'
slg = require 'slug'

fix = (r)->
  switch r.type()
    when 'attribute' then r.value()
    when 'text' then r.text()
    else r

fs.readFile __dirname + '/p', (err, data) ->
  if err?
    console.log err
  else
    doc = xml.parseXmlString data
    doc.toString()
    fn = jade.compileFile 'test.jade',
      pretty: true
    console.log fn
      $: (q, c=doc) ->
        fix c.get(q)
      $$: (q, c=doc) ->
        fix(r) for r in c.find(q)
      $att: (e, a) ->
        e?.attr(a)?.value()
      slug: (s) ->
        if s?
          slg(s).toLowerCase()
        else
          null
      version: 'xml2rfc.jade v0.0.1'

