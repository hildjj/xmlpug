xmlpug = require '../lib/index'
path = require 'path'

@transform = (test) ->
  test.ok xmlpug?
  xmlpug.transform '''
doctype html
html
  body
    = $$('/root/text()').join('')
    != $('em')
    != $('none')
    = $('count(em)')
    = $('em/text()')
  != "<!--" + $source.toString('utf8') + "-->"
  ''', '''
  <root>testing <em>one</em> two</root>
  ''',
    html: true
    pretty: true
  .then (out) ->
    test.ok out
    test.deepEqual out, '''<!DOCTYPE html>
<html>
  <body>testing two<em>one</em>1one</body>
  <!-- <root>testing <em>one</em> two</root> -->
</html>

'''
    test.done()

@transformFile = (test) ->
  pug = path.join __dirname, '..', 'examples', 'test.pug'
  xml =  path.join __dirname, '..', 'examples', 'test.xml'
  xmlpug.transformFile pug, xml,
    define:
      mode: "nodeunit transformFile"
  .then (out) ->
    test.ok out
    test.done()

@cmd = (test) ->
  xmlpug.cmd [
    'node'
    'xmlpug'
    path.join __dirname, '..', 'examples', 'test.pug'
    path.join __dirname, '..', 'examples', 'test.xml'
    '-o'
    path.join __dirname, '..', 'examples', 'test.html'
    '-p'
  ]
  .then (out) ->
    test.ok out
    test.done()

@genSource = (test) ->
  xmlpug.cmd [
    'node'
    'xmlpug'
    path.join __dirname, '..', 'examples', 'test.pug'
    "--source"
    path.join __dirname, '..', 'examples', 'testSource.js'
    "-c"
    path.join __dirname, '..', 'examples', 'config.json'
  ]
  .then (out) ->
    test.ok !out
    test.done()

@xformBuffer = (test) ->
  buf = new Buffer '<foo>boo</foo>'
  pug = path.join __dirname, 'bar.pug'
  xmlpug.transformFile pug, buf
  .then (out) ->
    test.ok out
    test.done()