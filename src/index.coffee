try
  require('source-map-support').install()
catch

fs = require 'fs'
{dentToString} = require 'dentin'
xml = require 'libxmljs'
jade = require 'jade'
pkg = require '../package'
path = require 'path'
temp = require('temp').track()
req = require

DEFAULT_CONFIG = "./.xmljade.json"

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
  pretty = options.pretty
  options.pretty = false
  if options.xmljadeSource
    fn = jade.compileClient jadedata, options
    fs.writeFileSync options.xmljadeSource, fn.toString()
  if not xmldata?
    return null
  xmldoc = xml.parseXmlString xmldata
  fn ?= jade.compile jadedata, options
  cache = {}
  out = fn
    $: (q='.', c=xmldoc, ns) ->
      if (c? and
          !ns? and
          (c not instanceof xml.Document) and
          (c not instanceof xml.Element))
        ns = c
        c = xmldoc
      fix c.get(q, ns)
    $$: (q='.', c=xmldoc, ns) ->
      if (c? and
          !ns? and
          (c not instanceof xml.Document) and
          (c not instanceof xml.Element))
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
  if pretty
    dopts = {}
    for k,v of options
      found = false
      k = k.replace /^dentin-/, ->
        found = true
        ""
      if found
        dopts[k] = v
    if not dopts.html?
      dopts.html = options.html
    try
      out = dentToString out, dopts
    catch err
      process.stderr.write "Problem parsing output for pretty printing: #{err.message}"
  out

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

@read_config = (opts, cb) ->
  if not opts?
    opts = {}
  cfg = opts.config ? DEFAULT_CONFIG
  if not cfg?
    return cb(null, opts)
  fs.exists cfg, (exists) ->
    if !exists then return cb(null, opts)
    fs.readFile cfg, (err, data) ->
      if err? then return cb(err)
      try
        config = JSON.parse data
        for k,v of config
          if not opts[k]?
            opts[k] = v
        cb(null, opts)
      catch er
        cb(er)

@cmd = (args, cb) ->
  commander = require 'commander'
  program = new commander.Command
  program
    .version pkg.version
    .usage '[options] <template> [input]'
    .option '-c, --config <file>', "Config file to read [#{DEFAULT_CONFIG}]",
      DEFAULT_CONFIG
    .option '-d, --debug', 'Add Jade debug information'
    .option '-o, --output [file]', 'Output file'
    .option '-p, --pretty', 'Pretty print'
    .option '--html', 'HTML output; only useful for pretty printing'
    .option '-s, --source [file]', 'Output source for client transformation'
    .parse args

  len = program.args.len
  if (program.source? and (len<1)) or (len <2)
    program.help()

  if program.args.length < 1
    program.help()

  opts =
    pretty: program.pretty
    compileDebug: program.debug
    xmljadeSource: program.source
    config: program.config
    html: false

  if program.html or (program.output? and program.output.match(/\.html?$/))
    opts.html = true

  @read_config opts, (er) =>
    if er?
      return process.stderr.write "#{program.config}: #{er.message}\n"
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
