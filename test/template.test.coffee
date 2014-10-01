xmljade = require '../lib/index'

@transform = (test) ->
  test.ok xmljade?
  out = xmljade.transform '''
  doctype html
  html
    body
      = $$('/root/text()').join('')
      != $('em')
  ''', '''
  <root>testing <em>one</em> two</root>
  '''
  test.ok out?
  test.deepEqual out, '''<!DOCTYPE html>
<html>
  <body>testing  two<em>one</em>
  </body>
</html>
'''
  test.done()

@transformFile = (test) ->
  xmljade.transformFile __dirname + '/../examples/test.jade', __dirname + '/../examples/test.xml', (er, output)->
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
