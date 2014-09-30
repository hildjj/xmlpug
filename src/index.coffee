fs = require 'fs'
xml = require 'libxmljs'
jade = require 'jade'
slg = require 'slug'
pkg = require '../package'

fix = (r)->
  switch r.type()
    when 'attribute' then r.value()
    when 'text' then r.text()
    else r

@transform = transform = (jadedata, xmldata, options={pretty:true}) ->
  xmldoc = xml.parseXmlString xmldata
  fn = jade.compile jadedata, options
  fn
    $: (q, c=xmldoc) ->
      fix c.get(q)
    $$: (q, c=xmldoc) ->
      fix(r) for r in c.find(q)
    $att: (e, a) ->
      e?.attr(a)?.value()
    slug: (s) ->
      if s?
        slg(s).toLowerCase()
      else
        null
    version: "#{pkg.name} v#{pkg.version}"

@transformFile = (jade, xml, options={pretty:true}, cb) ->
  if !cb?
    cb = ->
      # no-op

  fs.readFile xml, (err, xmldata) ->
    if err?
      return cb(err)
    fs.readFile jade, (err, jadedata) ->
      if err?
        return cb(err)
      options.filename = jade
      cb null, transform(jadedata, xmldata, options)

@cmd = (args) ->
  program = require 'commander'
  program
    .version pkg.version
    .usage '[options] <template> <input>'
    .option '-d, --debug', 'Add Jade debug information'
    .option '-o, --output [file]', 'Output file'
    .option '-p, --pretty', 'Pretty print'
    .parse args

  if program.args.length < 2
    program.help()

  opts =
    pretty: program.pretty
    compileDebug: program.debug
  @transformFile program.args[0], program.args[1], opts, (er, output) ->
    if er?
      return console.error(er)
    if program.output?
      fs.writeFile program.output, output, (er) ->
        if er?
          console.error er
    else
      console.log output
