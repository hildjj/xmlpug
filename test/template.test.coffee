xmljade = require '../lib/index'
path = require 'path'

@transform = (test) ->
  test.ok xmljade?
  xmljade.transform '''
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
  jade = path.join __dirname, '..', 'examples', 'test.jade'
  xml =  path.join __dirname, '..', 'examples', 'test.xml'
  xmljade.transformFile jade, xml,
    define:
      mode: "nodeunit transformFile"
  .then (out) ->
    test.ok out
    test.done()

@cmd = (test) ->
  xmljade.cmd [
    'node'
    'xmljade'
    path.join __dirname, '..', 'examples', 'test.jade'
    path.join __dirname, '..', 'examples', 'test.xml'
    '-o'
    path.join __dirname, '..', 'examples', 'test.html'
    '-p'
  ]
  .then (out) ->
    test.ok out
    test.done()

@genSource = (test) ->
  xmljade.cmd [
    'node'
    'xmljade'
    path.join __dirname, '..', 'examples', 'test.jade'
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
  jade = path.join __dirname, 'bar.jade'
  xmljade.transformFile jade, buf
  .then (out) ->
    test.ok out
    test.done()