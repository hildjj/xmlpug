fs = require 'fs'
xml = require 'libxmljs'
jade = require 'jade'
pkg = require '../package'
path = require 'path'
temp = require('temp').track()
req = require

fix = (r)->
  if !r?
    r
  else
    t = typeof r
    if t in ['string', 'number']
      r
    else
      switch r.type()
        when 'attribute' then r.value()
        when 'text' then r.text()
        else r

@transform = transform = (jadedata, xmldata, options={pretty:true}) ->
  if options.xmljadeSource
    fn = jade.compileClient jadedata, options
    fs.writeFileSync options.xmljadeSource, fn.toString()
  if xmldata?
    xmldoc = xml.parseXmlString xmldata
    fn = jade.compile jadedata, options
    cache = {}
    fn
      $: (q='.', c=xmldoc, ns) ->
        if c? and !ns? and (c not instanceof xml.Document) and (c not instanceof xml.Element)
          ns = c
          c = xmldoc
        fix c.get(q, ns)
      $$: (q='.', c=xmldoc, ns) ->
        if c? and !ns? and (c not instanceof xml.Document) and (c not instanceof xml.Element)
          ns = c
          c = xmldoc
        fix(r) for r in c.find(q, ns)
      $att: (e, a) ->
        if !e?
          null
        else if !a? or (typeof(a) == 'object')
          all = {}
          for at in e.attrs()
            v = at.value()
            if v?
              n = at.name()
              ns = at.namespace()
              if ns? and ns.prefix()?
                n = ns.prefix() + ':' + n
              all[n] = v
          if a?
            for n,v of a
              if v?
                all[n] = v
          all
        else
          e.attr(a)?.value()
      $nsDecls: (e) ->
        e = e or xmldoc.root()
        res = {}
        for ns in e.nsDecls()
          n = 'xmlns'
          p = ns.prefix()
          if p?
            n += ':' + p
          res[n] = ns.href()
        res
      $root: () ->
        xmldoc.root()
      $source: xmldata
      require: (mod) ->
        # HACK: write out a temporary file next to the jade template, and
        # require *it*, in order to require with all of the normal rules.
        # If require.path still worked, this wouldn't be necessary.  I'm
        # **REALLY** open to other ideas here, since this is pretty horrifying.
        m = cache[mod]
        if !m?
          dir = null
          if options.filename?
            dir = path.dirname(options.filename)
          tmp = temp.openSync
            dir: dir
            suffix: ".js"
          fs.writeSync tmp.fd, "module.exports = require('#{mod}');\n"
          fs.closeSync tmp.fd
          pth = path.resolve process.cwd(), tmp.path
          m = req pth
          cache[mod] = m
          setImmediate ->
            fs.unlinkSync pth
        m
      version: "#{pkg.name} v#{pkg.version}"

@transformFile = (jade, xml, options={pretty:true}, cb) ->
  if typeof options == 'function'
    [cb, options] = [options, {}]

  if !cb?
    cb = ->
      # no-op

  fs.readFile jade, (err, jadedata) ->
    if err?
      return cb(err)
    if xml?
      if xml == '-'
        # TODO: fix for windows
        xml = '/dev/stdin'
      fs.readFile xml, (err, xmldata) ->
        if err?
          return cb(err)
        options.filename = jade
        cb null, transform(jadedata, xmldata, options)
    else
      cb null, transform(jadedata, null, options)

@cmd = (args, cb) ->
  commander = require 'commander'
  program = new commander.Command
  program
    .version pkg.version
    .usage '[options] <template> <input>'
    .option '-d, --debug', 'Add Jade debug information'
    .option '-o, --output [file]', 'Output file'
    .option '-p, --pretty', 'Pretty print'
    .option '-s, --source [file]', 'Output source for client transformation'
    .parse args

  len = program.args.len
  if (program.source? and (len<1)) or (len <2)
    program.help()

  opts =
    pretty: program.pretty
    compileDebug: program.debug
    xmljadeSource: program.source
  @transformFile program.args[0], program.args[1], opts, (er, output) ->
    if er?
      return cb(er)
    if program.output?
      fs.writeFile program.output, output, (er) ->
        if er?
          return cb(er)
        cb(null, output)
    else
      if output?
        console.log output
      cb(null, output)
