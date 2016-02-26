xmljade = require '../lib/index'

@transform = (test) ->
  test.ok xmljade?
  xmljade.transform '''
doctype html
html
  body
    = $$('/root/text()').join('')
    != $('em')
  != "<!--" + $source.toString('utf8') + "-->"
  ''', '''
  <root>testing <em>one</em> two</root>
  ''',
    html: true
    pretty: true
  , (er, out) ->
    test.ok out?
    test.deepEqual out, '''<!DOCTYPE html>
<html>
  <body>testing two<em>one</em></body>
  <!-- <root>testing <em>one</em> two</root> -->
</html>

'''
    test.done()

@transformFile = (test) ->
  jade = __dirname + '/../examples/test.jade'
  xml =  __dirname + '/../examples/test.xml'
  xmljade.transformFile jade, xml,
    define:
      mode: "nodeunit transformFile"
  , (er, output)->
    test.ifError(er)
    test.done()

@cmd = (test) ->
  xmljade.cmd [
    'node'
    'xmljade'
    __dirname + '/../examples/test.jade'
    __dirname + '/../examples/test.xml'
    '-o'
    __dirname + '/../examples/test.html'
    '-p'
  ], (er, output)->
    test.ifError er
    test.done()

@genSource = (test) ->
  xmljade.cmd [
    'node'
    'xmljade'
    __dirname + '/../examples/test.jade'
    "--source"
    __dirname + '/../examples/testSource.js'
    "-c"
    __dirname + '/../examples/config.json'
  ], (er, output)->
    test.ifError er
    test.done()
