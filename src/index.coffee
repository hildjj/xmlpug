try
  require('source-map-support').install()
catch

bb = require 'bluebird'
fs = bb.promisifyAll(require 'fs')
{dentToString} = require 'dentin'
xml = require 'libxmljs'
jade = require 'jade'
pkg = require '../package'
path = require 'path'
resolve = require 'resolve'
cache = require './cache'
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

compileJade = (jadedata, options={}) ->
  if typeof(jadedata) =='function'
    return bb.resolve(jadedata)
  bb.try ->
    if options.xmljadeSource
      fn = jade.compileClient jadedata, options
      fs.writeFileAsync options.xmljadeSource, fn.toString()
  .then ->
    jade.compile jadedata, options

parseXml = (xmldata) ->
  xmldoc = xml.parseXmlString xmldata,
    noent: true
  if xmldoc?.errors.length > 0
    er = "XML Error (input XML #{e.line}:#{e.column}):\n"
    for e in xmldoc.errors
      e += "  #{e.message}\n"
    throw new Error(e)
  xmldoc

@transform = transform = (jadedata, xmldata, options={pretty:true}) ->
  pretty = options.pretty
  options.pretty = false
  compileJade jadedata, options
  .then (jadeFunc) ->
    if xmldata instanceof xml.Document
      xmldoc = xmldata
      xmldata = xmldoc.toString()
    else
      xmldoc = parseXml xmldata

    out = jadeFunc
      defs: options.define
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
      $element: (name, content) ->
        new xml.Element(xmldoc, name, content)
      $nsDecls: (e, a) ->
        e = e or xmldoc.root()
        res = {}
        for ns in e.namespaces(true)
          n = 'xmlns'
          p = ns.prefix()
          if p?
            n += ':' + p
          res[n] = ns.href()
        if a?
          for n,v of a
            if v?
              res[n] = v
        res
      $qname: (e) ->
        ns = e.namespace()
        if ns? and ns.prefix()?
          ns.prefix() + ":" + e.name()
        else
          e.name()
      $root: () ->
        xmldoc.root()
      $source: xmldata
      $sourceFile: options.xmlFileName
      require: (mod) ->
        dn = if options.jadeFileName
          path.dirname options.jadeFileName
        else
          __dirname
        fileName = resolve.sync mod,
          basedir: dn
        req fileName
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
      out = dentToString out, dopts
    out

@transformFile = transformFile = (jadeFileName, xml, options={pretty:true}) ->
  options.jadeFileName ?= jadeFileName
  bb.all [
    cache.read jadeFileName, (jadedata) ->
      compileJade jadedata, options
    switch
      when xml == null
        null
      when Buffer.isBuffer(xml)
        options.xmlFileName ?= 'Buffer'
        xml
      else
        if xml == '-'
          # TODO: fix for windows
          xml = '/dev/stdin'
        options.xmlFileName = xml
        cache.read xml
  ]
  .then ([jadeFunc, xmlData]) ->
    if xmlData
      transform jadeFunc, xmlData, options

@read_config = (opts={}) ->
  fs.readFileAsync(opts.config ? DEFAULT_CONFIG)
  .then (data) ->
    Object.assign opts, JSON.parse(data)
  .catchReturn opts

@cmd = (args) ->
  defs = {}
  define = (v) ->
    m = v.match /([^=]+)\s*=\s*(.*)/
    if not m
      console.error "Invalid definition: '#{v}'"
    else
      defs[m[1]] = m[2]

  commander = require 'commander'
  program = new commander.Command
  program
    .version pkg.version
    .usage '[options] <template> [input]'
    .option '-c, --config <file>', "Config file to read [#{DEFAULT_CONFIG}]",
      DEFAULT_CONFIG
    .option '-d, --debug', 'Add Jade debug information'
    .option '-D, --define [name=string]', 'Define a global variable', define
    .option '--doublequote', 'Use doublequotes instead of single'
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
    "dentin-doublequote": program.doublequote

  if program.html or (program.output? and program.output.match(/\.html?$/))
    opts.html = true

  @read_config opts
  .then (opts) ->
    if opts.define?
      opts.define = Object.assign defs, opts.define
    else
      opts.define = defs
    transformFile program.args[0], program.args[1], opts
  .then (output) ->
    return if !output?
    if program.output?
      fs.writeFileAsync program.output, output
      .thenReturn output
    else
      console.log output
      output
